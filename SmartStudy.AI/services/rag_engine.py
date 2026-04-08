import json
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableLambda
from models.schemas import ChatRequest
from core.config import logger, llm
from services.retriever import get_smart_retriever
from typing import AsyncGenerator

async def stream_chat_generator(request: ChatRequest) -> AsyncGenerator[str,None]:
    """
    Hàm Generator xử lý luồng chat và trả về từng chunk
    """
    try:
        retriever= await get_smart_retriever(
            user_id=request.user_id,
            course_id=request.course_id
        )

        async def fetch_context(inputs: dict) -> str:
            if retriever is None: return "Hiện tại không có tài liệu..."
            
            docs = await retriever.ainvoke(inputs["question"])
            
            if not docs: return "Không có thông tin liên quan trong tài liệu."
            
            formatted_docs = []
            for d in docs:
                page_no = d.metadata.get('PageNumber', 'Không rõ')
                formatted_docs.append(f"--- [Trang {page_no}] ---\n{d.page_content}")
                
            return "\n\n".join(formatted_docs)

        prompt = ChatPromptTemplate.from_messages([
            ("system", request.system_prompt),
            MessagesPlaceholder(variable_name="history"),
            ("human", """Dựa vào tài liệu được cung cấp dưới đây, hãy trả lời câu hỏi của tôi. 
        Nếu thông tin không có trong tài liệu, hãy thành thật trả lời là bạn không biết, đừng tự bịa ra kiến thức bên ngoài.

        TÀI LIỆU HỖ TRỢ:
        {context}

        ----------
        CÂU HỎI: {question}"""),
        ])

        # Pipeline LCEL
        chain = (
            {
                "context": RunnableLambda(fetch_context),
                "question": itemgetter("question"),
                "history": itemgetter("history")
            }
            | prompt
            | llm
            | StrOutputParser()
        )

        history_messages = [
            (msg.role if msg.role != "assistant" else "ai", msg.content) 
            for msg in request.history if len(msg.content.strip())>0
        ]

        async for chunk in chain.astream({
            "question": request.query,
            "history": history_messages
        }):
            yield json.dumps({
                "Type": "Text",
                "Content": chunk,
                "Data": None
            }) + "\n"

    except Exception as e:
        logger.error(f"Lỗi AI Engine: {str(e)}")
        error_response = {
            "Type": "Error",
            "Content": f"AI đang bận một chút, bạn thử lại nhé! (Chi tiết: {str(e)})",
            "Data": None
        }
        yield json.dumps(error_response) + "\n"