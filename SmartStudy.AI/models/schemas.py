from pydantic import BaseModel
from typing import List, Optional

# 1. Dùng cho luồng Hangfire (Đọc file)
class IngestRequest(BaseModel):
    file_url: str
    asset_id: int

# 2. Dùng cho luồng Chat
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[ChatMessage]=[]
    user_id: int
    system_prompt: str
    course_id: Optional[int]=None

class EmbedGraphRequest(BaseModel):
    label: str
    pg_ids: list[int]