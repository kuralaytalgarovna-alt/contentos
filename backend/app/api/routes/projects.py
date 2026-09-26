from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_project_membership, require_editor
from app.db.session import get_db
from app.models.brand_kit import BrandKit
from app.models.project import Project, ProjectMember, ProjectRole
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> list[ProjectOut]:
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == current_user.id).all()
    result = []
    for m in memberships:
        out = ProjectOut.model_validate(m.project)
        out.role = m.role
        result.append(out)
    return result


@router.post("", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProjectOut:
    project = Project(
        name=payload.name,
        niche=payload.niche,
        target_audience=payload.target_audience,
        tone_of_voice=payload.tone_of_voice,
    )
    db.add(project)
    db.flush()

    membership = ProjectMember(project_id=project.id, user_id=current_user.id, role=ProjectRole.owner)
    db.add(membership)

    brand_kit = BrandKit(project_id=project.id)
    db.add(brand_kit)

    db.commit()
    db.refresh(project)

    out = ProjectOut.model_validate(project)
    out.role = ProjectRole.owner
    return out


@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> ProjectOut:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    out = ProjectOut.model_validate(project)
    out.role = membership.role
    return out


@router.patch("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> ProjectOut:
    project = db.get(Project, project_id)
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    out = ProjectOut.model_validate(project)
    out.role = membership.role
    return out


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> None:
    if membership.role != ProjectRole.owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner can delete a project")
    project = db.get(Project, project_id)
    if project is not None:
        db.delete(project)
        db.commit()


class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: ProjectRole = ProjectRole.client_viewer


@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
def invite_member(
    project_id: str,
    payload: InviteMemberRequest,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> dict:
    if membership.role != ProjectRole.owner:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only the owner can invite members")

    user = db.query(User).filter(User.email == payload.email).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No user with that email yet")

    existing = (
        db.query(ProjectMember)
        .filter(ProjectMember.project_id == project_id, ProjectMember.user_id == user.id)
        .first()
    )
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already a member")

    new_member = ProjectMember(project_id=project_id, user_id=user.id, role=payload.role)
    db.add(new_member)
    db.commit()
    return {"status": "invited"}
