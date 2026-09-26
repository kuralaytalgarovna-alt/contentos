from pydantic import BaseModel, ConfigDict


class BrandKitUpdate(BaseModel):
    logo_media_id: str | None = None
    color_primary: str | None = None
    color_secondary: str | None = None
    color_accent: str | None = None
    font_heading: str | None = None
    font_body: str | None = None


class BrandKitOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    logo_media_id: str | None
    color_primary: str
    color_secondary: str
    color_accent: str
    font_heading: str
    font_body: str
