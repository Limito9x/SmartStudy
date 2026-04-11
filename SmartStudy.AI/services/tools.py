from core.config import logger, embeddings
from langchain.tools import tool
from core.database_services import get_vector_store
from services.graph_service import get_graph


async def _vector_search(query: str, asset_ids: list[str]) -> str:
    """
    Tìm kiếm thông tin trong tài liệu học tập bằng semantic search.
    Dùng khi cần tìm nội dung cụ thể, định nghĩa, giải thích khái niệm.
    """
    vector_store = await get_vector_store()
    retriever = vector_store.as_retriever(
        search_kwargs={
            "k": 5,
            "filter": {"asset_id": {"$in": asset_ids}}
        }
    )
    docs = await retriever.ainvoke(query)
    if not docs:
        return "Không tìm thấy thông tin liên quan trong tài liệu."
    
    results = []
    for d in docs:
        page = d.metadata.get("page_number", "?")
        results.append(f"[Trang {page}]\n{d.page_content}")
    return "\n\n---\n\n".join(results)

@tool
async def search_academic_graph(question: str):
    """
    Truy vấn thông tin học tập: Task, Course, Plan, Log.
    Dùng khi user hỏi về tiến độ, nội dung môn học hoặc kế hoạch cá nhân.
    """
    # 1. Biến câu hỏi thành Vector
    query_vector = await embeddings.aembed_query(question)
    
    # 2. Truy vấn Hybrid: Vector Search + Graph Traversal
    # Tìm 3 Task giống nhất -> Lấy thông tin môn học và kế hoạch liên quan
    query = """
    CALL db.index.vector.queryNodes('task_vector_idx', 3, $vector)
    YIELD node AS t, score
    MATCH (c:Course)-[:HAS_TASK]->(t)
    OPTIONAL MATCH (t)-[:HAS_LOG]->(l)
    RETURN t.name as Task, t.status as Status, c.name as Course, 
           l.note as Log, score
    ORDER BY score DESC
    """
    
    graph = get_graph()
    results = graph.query(query, {"vector": query_vector})
    
    if not results:
        return "Không tìm thấy dữ liệu liên quan trong đồ thị học tập."
        
    return str(results)

def build_tools(asset_ids: list[str]) -> list:
    
    @tool
    async def search_document(query: str) -> str:
        """
        Tìm kiếm lý thuyết, khái niệm, định nghĩa trong giáo trình.
        Dùng khi hỏi về: nội dung môn học, giải thích khái niệm, ví dụ.
        KHÔNG dùng cho task cá nhân hay tiến độ học tập.
        """
        return await _vector_search(query, asset_ids)

    tools = [search_academic_graph]
    if asset_ids:
        tools.append(search_document)
    return tools