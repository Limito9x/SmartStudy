from typing import List, Optional
import httpx
from sqlalchemy import text
from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from core.config import engine, embeddings, logger

class SmartStudyRetriever(BaseRetriever):
    user_id: int
    course_id: Optional[int] = None # Khai báo để LangChain nhận diện

    def _get_relevant_documents(self, query: str) -> List[Document]:
        allowed_asset_ids=[]

        try:
            with httpx.Client() as client:
                # Gọi tới endpoint bạn vừa làm bên .NET
                response = client.get(
                    f"http://host.docker.internal:5037/api/internal/allowed-assets",
                    params={"courseId": self.course_id, "userId": self.user_id},
                    timeout=5.0
                )
                if response.status_code == 200:
                    allowed_asset_ids = response.json() # Ví dụ: [101, 102, 105]
        except Exception as e:
            logger.error(f"Lỗi gọi .NET lấy quyền: {e}")
            return [] # Nếu lỗi phân quyền thì không trả về gì cả cho an toàn

        # 1. Chuyển query sang vector
        query_vector = embeddings.embed_query(query)
        vector_str = f"[{','.join(map(str, query_vector))}]"

        # 2. SQL JOIN để lọc chính xác theo CourseId
        # Chúng ta dùng JOIN giữa DocumentChunks và Assets dựa trên AssetId
        # SQL lọc theo danh sách ID từ .NET trả về
        sql = text("""
            SELECT "TextContent", "AssetId", "PageNumber"
            FROM "DocumentChunks"
            WHERE "AssetId" = ANY(:ids) 
            ORDER BY "Embedding" <=> :v
            LIMIT 5
        """)

        docs = []
        with engine.connect() as conn:
            results = conn.execute(sql, {"v": vector_str, "ids": allowed_asset_ids}).mappings().all()
            for res in results:
                docs.append(Document(
                    page_content=res["TextContent"],
                    metadata={"AssetId": res["AssetId"], "PageNumber": res["PageNumber"]}
                ))
        return docs
    
    async def _aget_relevant_documents(self, query: str) -> List[Document]:
        allowed_asset_ids=[]

        try:
            async with httpx.AsyncClient() as client:
                # Gọi tới endpoint bạn vừa làm bên .NET
                response = await client.get(
                    f"http://host.docker.internal:5037/api/internal/allowed-assets",
                    params={"courseId": self.course_id, "userId": self.user_id},
                    timeout=5.0
                )
                if response.status_code == 200:
                    allowed_asset_ids = response.json() # Ví dụ: [101, 102, 105]
        except Exception as e:
            logger.error(f"Lỗi gọi .NET lấy quyền: {e}")
            return [] # Nếu lỗi phân quyền thì không trả về gì cả cho an toàn

        logger.info(f"🔍 Đang RAG cho câu hỏi: {query}")
        logger.info(f"✅ .NET cho phép search trong AssetIds: {allowed_asset_ids}")

        # 1. Chuyển query sang vector
        query_vector = embeddings.embed_query(query)
        vector_str = f"[{','.join(map(str, query_vector))}]"

        # 2. SQL JOIN để lọc chính xác theo CourseId
        # Chúng ta dùng JOIN giữa DocumentChunks và Assets dựa trên AssetId
        # SQL lọc theo danh sách ID từ .NET trả về
        sql = text("""
            SELECT "TextContent", "AssetId", "PageNumber"
            FROM "DocumentChunks"
            WHERE "AssetId" = ANY(:ids) 
            ORDER BY "Embedding" <=> :v
            LIMIT 5
        """)

        docs = []
        with engine.connect() as conn:
            results = conn.execute(sql, {"v": vector_str, "ids": allowed_asset_ids}).mappings().all()
            logger.info(f"📚 Tìm thấy {len(results)} đoạn tài liệu liên quan.")
            for res in results:
                logger.info(f"--- [Trang {res['PageNumber']}] {res['TextContent'][:50]}...")
                docs.append(Document(
                    page_content=res["TextContent"],
                    metadata={"AssetId": res["AssetId"], "PageNumber": res["PageNumber"]}
                ))
        return docs