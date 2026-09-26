from pydantic import BaseModel, ConfigDict

from app.models.project import ProjectRole


class ProjectCreate(BaseModel):
    name: str
    niche: str = ""
    target_audience: str = ""
    tone_of_voice: str = ""


class ProjectUpdate(BaseModel):
    name: str | None = None
    niche: str | None = None
    target_audience: str | None = None
    tone_of_voice: str | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    niche: str
    target_audience: str
    tone_of_voice: str
    role: ProjectRole = ProjectRole.owner
