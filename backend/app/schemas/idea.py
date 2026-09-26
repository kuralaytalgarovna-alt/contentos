from datetime import datetime

from pydantic import BaseModel, ConfigDict


class IdeaGenerateRequest(BaseModel):
    goal: str = "engagement"  # engagement | reach | sales
    platform: str | None = None
    format: str | None = None
    count: int = 10


class IdeaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    rationale: str
    suggested_format: str
    suggested_platform: str
    created_at: datetime


class PostTextGenerateRequest(BaseModel):
    idea_id: str | None = None
    topic: str | None = None
    platform: str = "instagram"
    format: str = "post"


class PostTextGenerateResponse(BaseModel):
    title: str
    body: str
    cta_options: list[str]
    hashtags: str
