from core.config import db_url_async, db_url_sync
from langchain_postgres import PGEngine
from langchain_classic.indexes import SQLRecordManager

def init_schema():
    print("1. Đang tạo bảng vector document_chunks (nếu chưa có)...")
    pg_engine = PGEngine.from_connection_string(db_url_async)
    try:
        pg_engine.init_vectorstore_table(
            table_name="document_chunks",
            vector_size=768,
            metadata_json_column="langchain_metadata",
        )
    except Exception as exc:
        if "already exists" not in str(exc).lower():
            raise
    
    print("2. Đang tạo bảng upsertion_record...")
    namespace = "pgvector/document_chunks"
    record_manager = SQLRecordManager(
        namespace,
        db_url=db_url_sync,
    )
    record_manager.create_schema()
    
    print("✅ XONG! Extension đã có")

if __name__ == "__main__":
    init_schema()