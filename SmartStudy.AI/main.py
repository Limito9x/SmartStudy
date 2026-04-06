import os
import logging
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel
from llama_parse import LlamaParse
from dotenv import load_dotenv

# 1. Khởi tạo cấu hình
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartStudy.AI")

app = FastAPI(title="SmartStudy AI Service")

# 2. Định nghĩa Model dữ liệu đầu vào (Giống DTO trong C#)
class ParseRequest(BaseModel):
    file_url: str
    asset_id: int

# 3. Khởi tạo LlamaParse (Nên khởi tạo một lần để tái sử dụng)
api_key = os.getenv("LLAMA_CLOUD_API_KEY")
if not api_key:
    logger.error("Chưa cấu hình LLAMA_CLOUD_API_KEY!")
    raise RuntimeError("Missing API Key")

parser = LlamaParse(
    api_key=api_key,
    result_type="markdown",
    verbose=True
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/parse", status_code=status.HTTP_200_OK)
async def parse_document(request: ParseRequest):
    """
    Tiếp nhận URL từ .NET, nhờ LlamaParse đọc và trả về Markdown
    """
    logger.info(f"Đang xử lý Asset ID: {request.asset_id} từ URL: {request.file_url}")
    
    try:
        # SDK tự động lo liệu việc Upload URL và Polling kết quả cho bạn
        # Không còn vòng lặp while thủ công như bên .NET nữa!
        documents = await parser.aload_data(str(request.file_url))
        
        if not documents or len(documents) == 0:
            logger.warning(f"Không trích xuất được nội dung cho Asset {request.asset_id}")
            raise HTTPException(status_code=404, detail="Nội dung trống")

        # Tạo mảng lưu chi tiết từng trang
        parsed_pages = []
        for i, doc in enumerate(documents):
            parsed_pages.append({
                "page_number": i + 1,
                "markdown": doc.text
            })

        return {
            "asset_id": request.asset_id,
            "pages": parsed_pages, # Trả về mảng chia trang rõ ràng
            "total_pages": len(documents)
        }

    except Exception as e:
        logger.error(f"Lỗi khi xử lý LlamaParse: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"AI Service Error: {str(e)}"
        )