from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MediaAssetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    filename: str
    content_type: str
    url: str
    tags: str
    created_at: datetime


class MediaTagsUpdate(BaseModel):
    tags: str
