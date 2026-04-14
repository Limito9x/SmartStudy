from services.graph_service import get_graph
from core.config import embeddings, logger

EMBEDDING_CONFIG = {
    "Task": {
        "fetch_query": """
            MATCH (c:Course)-[:HAS_TASK]->(t:Task)
            WHERE t.pg_id = $id
            RETURN t.name as t_name,
                   coalesce(t.description, '') as t_desc, 
                   coalesce(t.type, '') as t_type,
                   c.name as c_name
        """,
        "format": "Nhiệm vụ: {t_name} ({t_type}). Thuộc môn: {c_name}. Chi tiết: {t_desc}"
    },
    "Course": {
        "fetch_query": """
            MATCH (p:StudyPlan)-[:HAS_COURSE]->(c:Course)
            WHERE c.pg_id = $id
            RETURN c.name as course_name, c.goal as goal, p.name as plan_name
        """,
        "format": "Khóa học: {course_name}. Mục tiêu: {goal}. Thuộc kế hoạch: {plan_name}."
    }
}

async def process_node_embeddings(label: str, pg_ids: list[int]):
    config = EMBEDDING_CONFIG.get(label)
    graph = get_graph()
    count=0

    for pg_id in pg_ids:
        try:
            pid_str=str(pg_id)
            # 1. Đọc cả Node và Metadata liên quan bằng câu Query đã cấu hình
            data = graph.query(config["fetch_query"], {"id": pid_str})
            
            if data:
                row = data[0] # Lấy kết quả đầu tiên
                
                # 2. Gộp Metadata thành chuỗi văn bản theo format
                text_to_embed = config["format"].format(**row)
                
                # 3. Biến chuỗi này thành Vector
                vector = await embeddings.aembed_query(text_to_embed)

                # 4. Lưu cái Vector này vào đúng cái Node gốc (Task/Course)
                graph.query(
                    f"MATCH (n:{label} {{pg_id: $id}}) SET n.embedding = $vector",
                    {"id": pid_str, "vector": vector}
                )
                count += 1
                logger.info(f"Đã Embedding cho {label} ID: {pid_str}")
            else:
                logger.warning(f"Không tìm thấy {label} với pg_id: {pid_str} trong DB")
        except Exception as e:
            logger.error(f"Lỗi khi embed cho label {label} {pg_id} {e}")