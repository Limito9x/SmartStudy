from typing import Optional
import httpx
from core.database_services import get_vector_store
from core.config import embeddings, logger, db_url_async
    
async def get_smart_retriever(user_id: int, course_id: Optional[int] = None):
    """
    Hàm gọi sang .NET để check quyền, sau đó trả về công cụ tìm kiếm (Retriever) của LangChain.
    """
    allowed_asset_ids = []

    # 1. Gọi .NET lấy danh sách AssetId được phép
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://host.docker.internal:5037/api/internal/allowed-assets",
                params={"courseId": course_id, "userId": user_id},
                timeout=5.0
            )
            if response.status_code == 200:
                allowed_asset_ids = response.json() 
    except Exception as e:
        logger.error(f"Lỗi gọi .NET lấy quyền: {e}")
        # Nếu lỗi, có thể trả về None hoặc xử lý ngắt luồng chat ở đây
        return None 

    logger.info(f"✅ .NET cho phép user {user_id} search trong AssetIds: {allowed_asset_ids}")

    # Xử lý trường hợp User không có quyền xem file nào
    if not allowed_asset_ids:
        logger.warning("Danh sách Asset trống. Trả về None.")
        return None
    
    vector_store = await get_vector_store()

    # 3. Phép màu nằm ở đây: Gọi as_retriever với bộ lọc Metadata
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": 5,
            "filter": {"AssetId": {"$in": [str(id) for id in allowed_asset_ids]}}
        }
    )

    return retriever