import os

from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from models.schemas import ParseRequest, ChatRequest
from services.llama_parser import process_document_from_url
from services.rag_engine import stream_chat_generator
from core.config import logger

router = APIRouter()

INTERNAL_KEY = os.getenv("INTERNAL_SERVICE_KEY", "SmartStudy_Secret_123")

@router.post("/parse")
async def parse_document(request: ParseRequest):
    """Endpoint dùng cho Hangfire Job"""
    try:
        documents = await process_document_from_url(request.file_url)
        if not documents:
            raise HTTPException(status_code=404, detail="Nội dung trống")

        parsed_pages = [{"page_number": i + 1, "markdown": doc.text} for i, doc in enumerate(documents)]
        
        return {
            "asset_id": request.asset_id,
            "pages": parsed_pages,
            "total_pages": len(documents)
        }
    except Exception as e:
        logger.error(f"Lỗi khi Parse: {str(e)}")
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