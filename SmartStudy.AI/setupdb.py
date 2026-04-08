from sqlalchemy import text
from core.config import engine # Cái engine dùng psycopg2 của ông đó
from langchain_community.indexes import _sql_record_manager

def init_schema():
    print("1. Đang tạo extension vector (nếu chưa có)...")
    with engine.connect() as conn:
        # Lệnh này cực kỳ quan trọng, phải chạy bằng Sync driver
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        conn.commit()
    
    print("2. Đang tạo bảng upsertion_record...")
    namespace = "pgvector/document_chunks"
    record_manager = _sql_record_manager.SQLRecordManager(
        namespace, db_url=engine.url # Dùng luôn URL của engine
    )
    record_manager.create_schema()
    
    print("✅ XONG! Extension đã có")

if __name__ == "__main__":
    init_schema()