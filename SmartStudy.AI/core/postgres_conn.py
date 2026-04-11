import asyncpg
from config import raw_db_url

async def get_pg_connection():
    # Nhớ thay thông tin của ông vào nhé
    try:
        conn = await asyncpg.connect(raw_db_url)
        return conn
    except Exception as e:
        print(f"Lỗi kết nối: {e}")