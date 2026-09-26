from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.post import Platform, PostFormat, PostStatus


class PostCreate(BaseModel):
    title: str = ""
    body: str = ""
    cta: str = ""
    hashtags: str = ""
    platform: Platform
    format: PostFormat = PostFormat.post
    status: PostStatus = PostStatus.draft
    scheduled_at: datetime | None = None
    cover_media_id: str | None = None


class PostUpdate(BaseModel):
    title: str | None = None
    body: str | None = None
    cta: str | None = None
    hashtags: str | None = None
    platform: Platform | None = None
    format: PostFormat | None = None
    status: PostStatus | None = None
    scheduled_at: datetime | None = None
    cover_media_id: str | None = None


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    title: str
    body: str
    cta: str
    hashtags: str
    platform: Platform
    format: PostFormat
    status: PostStatus
    scheduled_at: datetime | None
    cover_media_id: str | None
    created_at: datetime
    updated_at: datetime
