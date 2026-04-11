import os

from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from fastapi.responses import StreamingResponse
from models.schemas import IngestRequest, ChatRequest, EmbedGraphRequest
from services.rag_ingestion import parse_document, split_chunks, run_indexing, delete_asset_chunks
from services.agent_engine import stream_chat_generator
from services.graph_embedding import process_node_embeddings
from core.config import logger

router = APIRouter()

INTERNAL_KEY = os.getenv("INTERNAL_SERVICE_KEY", "SmartStudy_Secret_123")

@router.post("/ingest")
async def ingest_asset(request: IngestRequest):
    """
    API xử lý tài liệu: Tải file -> Parse Markdown -> Chunking -> Indexing (Lưu PGVector)
    """
    logger.info(f"Bắt đầu xử lý Asset ID: {request.asset_id}")
    
    try:
        # Bước 1: Parse (Đọc file từ Cloudinary thành Markdown)
        logger.info("Đang gọi LlamaParse...")
        markdown_text = await parse_document(request.file_url)
        
        # Bước 2: Chunking (Cắt nhỏ và nhồi AssetId vào Metadata)
        logger.info("Đang cắt văn bản (Chunking)...")
        documents = await split_chunks(markdown_text, request.asset_id)
        
        # Bước 3: Indexing (Lưu vào Database và tự động Overwrite nếu trùng AssetId)
        logger.info("Đang lưu vào Vector Database...")
        result = await run_indexing(documents)
        
        logger.info(f"Hoàn tất Asset {request.asset_id}: {result}")
        
        # Trả về kết quả cho .NET biết (số chunk thêm mới, xóa, cập nhật)
        return {
            "status": "success",
            "message": "Tài liệu đã được AI học xong!",
            "details": result
        }
        
    except Exception as e:
        logger.error(f"Lỗi khi xử lý Asset {request.asset_id}: {str(e)}")
        # Ném lỗi 500 về cho .NET để nó biết mà hiển thị thông báo thất bại
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/api/ingest")
async def delete_asset(asset_ids: list[str]):
    try:
        delete_asset_chunks(asset_ids)
        return {"status": "success", "message": f"{len(asset_ids)} asset đã bị xóa khỏi não bộ AI."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_with_ai(request: ChatRequest, x_internal_service_key: str = Header(None)):
    """Endpoint Stream Chat"""
    # 1. Kiểm tra khóa bảo mật (chỉ .Net được gọi)
    if x_internal_service_key != INTERNAL_KEY:
        raise HTTPException(status_code=401, detail="Từ chối truy cập, sai INTERNAL KEY!")

    # 2. Mở luồng stream
    return StreamingResponse(
        stream_chat_generator(request),
        media_type="text/event-stream"
    )

@router.post("/graph/embedding")
async def embedding_graph(request: EmbedGraphRequest, background_task: BackgroundTasks):
    """Embedding các node của graph"""
    background_task.add_task(process_node_embeddings,request.label,request.pg_ids)
    return {"status": "processing", "message": f"Đang 'nén' {len(request.pg_ids)} {request.label}..."}
        
