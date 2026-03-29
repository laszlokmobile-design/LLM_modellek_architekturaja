#backend/schemas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    role: str
    content: str
    file_path: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    conv_id: Optional[int] = None
    temperature: float = 0.7
    top_p: float = 1.0
    file_data: Optional[str] = None # Base64 kódolt fájl

class ConversationRead(BaseModel):
    id: int
    title: str
    created_at: datetime

    class Config:
        from_attributes = True
