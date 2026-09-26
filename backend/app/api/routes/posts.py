from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_project_membership, require_editor
from app.db.session import get_db
from app.models.post import Platform, Post
from app.models.project import ProjectMember
from app.schemas.post import PostCreate, PostOut, PostUpdate

router = APIRouter(prefix="/projects/{project_id}/posts", tags=["posts"])


@router.get("", response_model=list[PostOut])
def list_posts(
    project_id: str,
    platform: Platform | None = Query(default=None),
    date_from: datetime | None = Query(default=None),
    date_to: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> list[Post]:
    q = db.query(Post).filter(Post.project_id == project_id)
    if platform is not None:
        q = q.filter(Post.platform == platform)
    if date_from is not None:
        q = q.filter(Post.scheduled_at >= date_from)
    if date_to is not None:
        q = q.filter(Post.scheduled_at <= date_to)
    return q.order_by(Post.scheduled_at.is_(None), Post.scheduled_at).all()


@router.post("", response_model=PostOut, status_code=status.HTTP_201_CREATED)
def create_post(
    project_id: str,
    payload: PostCreate,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> Post:
    post = Post(project_id=project_id, **payload.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("/{post_id}", response_model=PostOut)
def get_post(
    project_id: str,
    post_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> Post:
    post = db.query(Post).filter(Post.id == post_id, Post.project_id == project_id).first()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
    return post


@router.patch("/{post_id}", response_model=PostOut)
def update_post(
    project_id: str,
    post_id: str,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> Post:
    post = db.query(Post).filter(Post.id == post_id, Post.project_id == project_id).first()
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    project_id: str,
    post_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> None:
    post = db.query(Post).filter(Post.id == post_id, Post.project_id == project_id).first()
    if post is not None:
        db.delete(post)
        db.commit()
