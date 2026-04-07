import json
from operator import itemgetter

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from models.schemas import ChatRequest
from core.config import logger, llm
from services.retriever import SmartStudyRetriever
from typing import AsyncGenerator

async def stream_chat_generator(request: ChatRequest) -> AsyncGenerator[str,None]:
    """
    Hàm Generator xử lý luồng chat và trả về từng chunk
    """
    try:
        retriever=SmartStudyRetriever(user_id=request.user_id,course_id=request.course_id)

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
                "context": itemgetter("question") | retriever | (lambda docs: "\n\n".join(d.page_content for d in docs)),
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