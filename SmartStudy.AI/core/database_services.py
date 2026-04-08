from langchain_postgres import PGVectorStore, PGEngine
from langchain_classic.indexes import SQLRecordManager
from core.config import db_url_async, embeddings

# Singleton instances
_vector_store = None
_record_manager = None

async def get_vector_store():
    global _vector_store
    if _vector_store is None:
        # 1. Khởi tạo PGEngine từ connection string (theo image_f84907.png)
        # Thằng này nó tự lo vụ async/sync bên dưới rồi
        engine = PGEngine.from_connection_string(db_url_async)
        
        # 2. Dùng hàm .create() với đúng tham số IntelliSense (image_f7be3a.png)
        # Tham số là 'embedding_service', không phải 'embeddings'
        _vector_store = await PGVectorStore.create(
            engine=engine,
            table_name="document_chunks",
            embedding_service=embeddings
        )
    return _vector_store

def get_record_manager():
    global _record_manager
    if _record_manager is None:
        # Thằng này vẫn dùng URL string là đủ, nó không "sang chảnh" như thằng Store
        _record_manager = SQLRecordManager(
            namespace="pgvector/document_chunks",
            db_url=db_url_async,
            async_mode=True
        )
    return _record_manager