from llama_parse import LlamaParse
from core.config import LLAMA_CLOUD_API_KEY, logger

# Khởi tạo instance 1 lần duy nhất
parser = LlamaParse(
    api_key=LLAMA_CLOUD_API_KEY,
    result_type="markdown",
    verbose=True
)

async def process_document_from_url(file_url: str) -> list:
    """Hàm tải và parse URL, trả về danh sách các trang"""
    logger.info(f"Đang bóc tách tài liệu từ: {file_url}")
    documents = await parser.aload_data(file_url)
    return documents