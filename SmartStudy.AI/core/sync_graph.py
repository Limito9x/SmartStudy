import asyncio
from dotenv import load_dotenv
from postgres_conn import get_pg_connection
from neo4j_conn import get_neo4j_driver

load_dotenv()

async def sync_postgres_to_neo4j():
    print("⏳ Bắt đầu quá trình đồng bộ dữ liệu...")

    # 1. Kết nối Postgresql
    pg_conn = await get_pg_connection()
    
    # 2. Mở vòi Neo4j
    neo_driver = get_neo4j_driver()
    

    try:
        # === BƯỚC 1: EXTRACT (Hút dữ liệu từ Postgres) ===
        print("📥 Đang kéo dữ liệu từ Postgres...")
        query = """
            SELECT c."Id" as course_id, c."Name" as course_name,
                   t."Id" as task_id, t."Name" as task_name, t."Status" as task_status
            FROM "Courses" c
            JOIN "Tasks" t ON c."Id" = t."CourseId"
        """
        rows = await pg_conn.fetch(query)

        # === BƯỚC 2: TRANSFORM (Gói dữ liệu lại thành mảng JSON/Dict) ===
        data_batch = []
        for row in rows:
            data_batch.append({
                "courseId": str(row['course_id']), # Neo4j thích ID dạng chuỗi hơn
                "courseName": row['course_name'],
                "taskId": str(row['task_id']),
                "taskName": row['task_name'],
                "taskStatus": row['task_status']
            })

        if not data_batch:
            print("⚠️ Không có dữ liệu nào trong Postgres để đồng bộ.")
            return

        # === BƯỚC 3: LOAD (Bơm vào Neo4j bằng UNWIND và MERGE) ===
        print(f"🚀 Đang bơm {len(data_batch)} records vào Neo4j...")
        cypher_query = """
        UNWIND $batch AS row
        
        // 1. Tạo hoặc Cập nhật Node Course (Dùng MERGE dựa trên ID)
        MERGE (c:Course {pgId: row.courseId})
        SET c.name = row.courseName
        
        // 2. Tạo hoặc Cập nhật Node Task
        MERGE (t:Task {pgId: row.taskId})
        SET t.name = row.taskName, t.status = row.taskStatus
        
        // 3. Nối chúng lại với nhau
        MERGE (c)-[:HAS_TASK]->(t)
        """

        async with neo_driver.session() as session:
            await session.run(cypher_query, batch=data_batch)

        print("✅ ĐỒNG BỘ THÀNH CÔNG! Mở Neo4j Desktop lên ngắm đồ thị thôi ông ơi!")

    except Exception as e:
        print(f"❌ Có lỗi xảy ra: {e}")
    finally:
        # Nhớ đóng vòi nước lại
        await pg_conn.close()
        await neo_driver.close()

# Chạy script
if __name__ == "__main__":
    asyncio.run(sync_postgres_to_neo4j())