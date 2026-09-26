from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_project_membership, require_editor
from app.db.session import get_db
from app.models.brand_kit import BrandKit
from app.models.project import ProjectMember
from app.schemas.brand_kit import BrandKitOut, BrandKitUpdate

router = APIRouter(prefix="/projects/{project_id}/brand-kit", tags=["brand-kit"])


@router.get("", response_model=BrandKitOut)
def get_brand_kit(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> BrandKit:
    kit = db.query(BrandKit).filter(BrandKit.project_id == project_id).first()
    if kit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand kit not found")
    return kit


@router.patch("", response_model=BrandKitOut)
def update_brand_kit(
    project_id: str,
    payload: BrandKitUpdate,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> BrandKit:
    kit = db.query(BrandKit).filter(BrandKit.project_id == project_id).first()
    if kit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Brand kit not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(kit, field, value)

    db.commit()
    db.refresh(kit)
    return kit
