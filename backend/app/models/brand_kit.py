import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BrandKit(Base):
    __tablename__ = "brand_kits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), unique=True, nullable=False)

    logo_media_id: Mapped[str | None] = mapped_column(ForeignKey("media_assets.id"), nullable=True)
    color_primary: Mapped[str] = mapped_column(String(9), default="#6366F1")
    color_secondary: Mapped[str] = mapped_column(String(9), default="#0EA5E9")
    color_accent: Mapped[str] = mapped_column(String(9), default="#F59E0B")
    font_heading: Mapped[str] = mapped_column(String(100), default="Inter")
    font_body: Mapped[str] = mapped_column(String(100), default="Inter")

    project: Mapped["Project"] = relationship(back_populates="brand_kit")
