"""
AI Pydantic Schemas
"""

from typing import Optional, List
from pydantic import BaseModel
from app.schemas.map import Coordinates, MapRecommendation


class ChatMessageSchema(BaseModel):
    id: str
    sender: str
    text: str
    timestamp: str
    suggestedActions: Optional[List[str]] = None


class AiChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
    currentLocation: Optional[Coordinates] = None
    vesselId: Optional[str] = None


class AiChatResponse(BaseModel):
    conversationId: str
    message: ChatMessageSchema
    suggestedActions: Optional[List[str]] = None
