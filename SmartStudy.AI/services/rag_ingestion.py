from llama_parse import LlamaParse
from sqlalchemy import text
from core.config import LLAMA_CLOUD_API_KEY, logger, engine
from core.database_services import get_vector_store, get_record_manager
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_postgres import PGVector
from langchain_core.indexing import aindex


# Khởi tạo instance 1 lần duy nhất
parser = LlamaParse(
    api_key=LLAMA_CLOUD_API_KEY,
    result_type="markdown",
    verbose=True
)

async def parse_document(file_url: str) -> list:
    """Hàm tải và parse URL, trả về danh sách các trang"""
    logger.info(f"Đang bóc tách tài liệu từ: {file_url}")
    documents = await parser.aload_data(file_url)
    return documents

async def split_chunks(parsed_pages:list,asset_id:int):
    """Hàm cắt các markdown thành chunk"""
    logger.info(f"Đang cắt markdown thành chunk cho assetId: {asset_id}")
    
    headers_to_split_on = [
        ("#", "Header1"),
        ("##", "Header2"),
        ("###", "Header3")
    ]

    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False #False để giữ lại ký tự '#' trong text cho AI dễ đọc
    )

    all_chunks = []

    # BẮT ĐẦU VÒNG LẶP: Duyệt qua từng trang
    for index, page in enumerate(parsed_pages):
        page_num = index + 1 # Trang 1, 2, 3...
        
        # Tùy LlamaParse trả về, lấy text của trang đó
        page_text = page.text if hasattr(page, 'text') else page.page_content
        
        # Chỉ cắt văn bản trên ĐÚNG TRANG NÀY
        page_chunks = markdown_splitter.split_text(page_text)
        
        # Nhét cả AssetId và PageNumber vào túi Metadata
        for chunk in page_chunks:
            chunk.metadata["AssetId"] = str(asset_id)
            chunk.metadata["PageNumber"] = page_num # Thêm dòng này là xong!
            all_chunks.append(chunk)

    return all_chunks

async def run_indexing(documents):
    """Hàm thực hiện Indexing"""

    vector_store=await get_vector_store()

    record_manager=get_record_manager()

    await record_manager.acreate_schema()

    indexing_result = await aindex(
        docs_source=documents,
        record_manager=record_manager,
        vector_store=vector_store,
        cleanup="incremental",
        source_id_key="AssetId"
    )

    return indexing_result

def delete_asset_chunks(asset_id: int):
    """
    Hàm dọn dẹp sạch sẽ mọi dấu vết của một Asset trong Vector Database.
    """
    try:
        # Dùng engine.begin() để mở Transaction, lỗi là tự rollback
        with engine.begin() as conn:
            # 1. Xóa dữ liệu nhúng (Vector & Text)
            # Ép kiểu asset_id thành string vì trong cmetadata nó thường lưu dưới dạng JSON String
            conn.execute(
                text("DELETE FROM langchain_pg_embedding WHERE cmetadata->>'AssetId' = :id"),
                {"id": str(asset_id)}
            )
            
            # 2. Xóa sổ (upsertion_record) của RecordManager
            # LangChain lưu cái source_id_key ("AssetId") vào cột group_id
            conn.execute(
                text("DELETE FROM upsertion_record WHERE group_id = :id"),
                {"id": str(asset_id)}
            )
            
        logger.info(f"Đã dọn sạch rác Vector cho Asset {asset_id}")
        return True
    except Exception as e:
        logger.error(f"Lỗi khi xóa Vector của Asset {asset_id}: {str(e)}")
        raise e