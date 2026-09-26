from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_project_membership, require_editor
from app.db.session import get_db
from app.models.idea import Idea
from app.models.project import Project, ProjectMember
from app.schemas.idea import (
    IdeaGenerateRequest,
    IdeaOut,
    PostTextGenerateRequest,
    PostTextGenerateResponse,
)
from app.services.ai import generate_ideas, generate_post_text

router = APIRouter(prefix="/projects/{project_id}/ideas", tags=["ideas"])


@router.get("", response_model=list[IdeaOut])
def list_ideas(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> list[Idea]:
    return (
        db.query(Idea)
        .filter(Idea.project_id == project_id)
        .order_by(Idea.created_at.desc())
        .all()
    )


@router.post("/generate", response_model=list[IdeaOut], status_code=status.HTTP_201_CREATED)
def generate(
    project_id: str,
    payload: IdeaGenerateRequest,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> list[Idea]:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    generated = generate_ideas(
        niche=project.niche,
        audience=project.target_audience,
        tone=project.tone_of_voice,
        goal=payload.goal,
        platform=payload.platform,
        count=payload.count,
    )

    ideas = [
        Idea(
            project_id=project_id,
            title=g.title,
            rationale=g.rationale,
            suggested_format=g.suggested_format,
            suggested_platform=g.suggested_platform,
        )
        for g in generated
    ]
    db.add_all(ideas)
    db.commit()
    for idea in ideas:
        db.refresh(idea)
    return ideas


@router.post("/generate-text", response_model=PostTextGenerateResponse)
def generate_text(
    project_id: str,
    payload: PostTextGenerateRequest,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> PostTextGenerateResponse:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    topic = payload.topic
    if payload.idea_id:
        idea = db.get(Idea, payload.idea_id)
        if idea is not None:
            topic = idea.title

    result = generate_post_text(
        topic=topic or "",
        niche=project.niche,
        tone=project.tone_of_voice,
        platform=payload.platform,
        format=payload.format,
    )
    return PostTextGenerateResponse(**result)


@router.delete("/{idea_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_idea(
    project_id: str,
    idea_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> None:
    idea = db.query(Idea).filter(Idea.id == idea_id, Idea.project_id == project_id).first()
    if idea is not None:
        db.delete(idea)
        db.commit()
