import json
from typing import AsyncGenerator
from langchain_core.messages import HumanMessage, AIMessage

from langchain.agents import create_agent

from models.schemas import ChatRequest
from core.config import llm, logger
from services.retriever import get_allowed_asset_ids
from services.tools import build_tools

async def stream_chat_generator(request: ChatRequest) -> AsyncGenerator[str, None]:
    try:
        asset_ids = await get_allowed_asset_ids(request.user_id, request.course_id)
        asset_ids = [str(asset_id) for asset_id in (asset_ids or []) if asset_id is not None]

        logger.info(
            "Selected asset ids from request: %s | Allowed asset ids: %s",
            request.selected_asset_ids,
            asset_ids,
        )

        if request.selected_asset_ids:
            selected_ids = {
                str(asset_id)
                for asset_id in request.selected_asset_ids
                if isinstance(asset_id, int) and asset_id > 0
            }
            asset_ids = [
                asset_id
                for asset_id in asset_ids
                if asset_id in selected_ids
            ]

            if not asset_ids:
                logger.warning(
                    "SelectedAssetIds were provided but no allowed asset ids remained after filtering: %s",
                    request.selected_asset_ids,
                )

        tools = build_tools(asset_ids, request.user_id, request.course_id)

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
            logger.debug(f"Event received: {kind} {event.get('name', '')}")

            if kind == "on_tool_start" and event["name"] == "trigger_phase_preview":
                try:
                    tool_input = event["data"].get("input", {})
                    
                    ui_payload = {
                        "type": "GEN_UI_PHASE_PREVIEW",
                        "data": tool_input
                    }
                    yield json.dumps({
                        "Type": "UI",
                        "Data": json.dumps(ui_payload)
                    }) + "\n"
                except Exception as ex:
                    logger.error(f"Error intercepting trigger_phase_preview: {ex}")

            elif kind == "on_chat_model_stream":
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