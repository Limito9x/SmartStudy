import json
from typing import AsyncGenerator
from langchain_core.messages import HumanMessage, AIMessage

# QUAN TRỌNG: Import "Vũ khí tối thượng" mới của LangChain
from langchain.agents import create_agent

from models.schemas import ChatRequest
from core.config import llm, logger
from services.retriever import get_allowed_asset_ids
from services.tools import build_tools

async def stream_chat_generator(request: ChatRequest) -> AsyncGenerator[str, None]:
    try:
        asset_ids = await get_allowed_asset_ids(request.user_id, request.course_id)

        tools = build_tools(asset_ids)

        app = create_agent(
            model=llm, 
            tools=tools,
            system_prompt=request.system_prompt
        )

        messages = [
            HumanMessage(content=m.content) if m.role == "user" else AIMessage(content=m.content)
            for m in request.history if m.content.strip()
        ]
        messages.append(HumanMessage(content=request.query))

        async for event in app.astream_events(
            {"messages": messages},
            version="v2"
        ):
            kind = event["event"]

            if kind == "on_chat_model_stream":
                chunk = event["data"]["chunk"]
                if chunk.content and isinstance(chunk.content, str):
                    yield json.dumps({
                        "Type": "Text",
                        "Content": chunk.content,
                        "Data": None
                    }) + "\n"

    except Exception as e:
        logger.error(f"Lỗi LangGraph Agent: {e}")
        yield json.dumps({
            "Type": "Error",
            "Content": f"Đặc vụ AI đang gặp sự cố: {e}",
            "Data": None
        }) + "\n"