import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Platform(str, enum.Enum):
    instagram = "instagram"
    tiktok = "tiktok"
    facebook = "facebook"
    telegram = "telegram"
    threads = "threads"


class PostFormat(str, enum.Enum):
    post = "post"
    reels = "reels"
    story = "story"
    carousel = "carousel"


class PostStatus(str, enum.Enum):
    draft = "draft"
    in_review = "in_review"
    approved = "approved"
    scheduled = "scheduled"
    published = "published"


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(255), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    cta: Mapped[str] = mapped_column(String(500), default="")
    hashtags: Mapped[str] = mapped_column(String(500), default="")

    platform: Mapped[Platform] = mapped_column(Enum(Platform), nullable=False)
    format: Mapped[PostFormat] = mapped_column(Enum(PostFormat), default=PostFormat.post)
    status: Mapped[PostStatus] = mapped_column(Enum(PostStatus), default=PostStatus.draft)

    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    cover_media_id: Mapped[str | None] = mapped_column(ForeignKey("media_assets.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project: Mapped["Project"] = relationship(back_populates="posts")
