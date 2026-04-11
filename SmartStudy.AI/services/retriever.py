from typing import Optional
import httpx
from core.config import logger
    


async def get_allowed_asset_ids(user_id:int,course_id:Optional[int]):
    """
    Hàm gọi sang .NET để check quyền, sau đó trả về công cụ tìm kiếm (Retriever) của LangChain.
    """

    # 1. Gọi .NET lấy danh sách AssetId được phép
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://host.docker.internal:5037/api/internal/allowed-assets",
                params={"courseId": course_id, "userId": user_id},
                timeout=5.0
            )
            if response.status_code == 200:
                return response.json() 
    except Exception as e:
        logger.error(f"Lỗi gọi .NET lấy quyền: {e}")
        # Nếu lỗi, có thể trả về None hoặc xử lý ngắt luồng chat ở đây
        return None 