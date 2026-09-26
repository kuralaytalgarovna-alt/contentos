import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import get_project_membership, require_editor
from app.core.config import get_settings
from app.db.session import get_db
from app.models.media import MediaAsset
from app.models.project import ProjectMember
from app.schemas.media import MediaAssetOut, MediaTagsUpdate

router = APIRouter(prefix="/projects/{project_id}/media", tags=["media"])
settings = get_settings()

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4"}
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024


@router.get("", response_model=list[MediaAssetOut])
def list_media(
    project_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(get_project_membership),
) -> list[MediaAsset]:
    return (
        db.query(MediaAsset)
        .filter(MediaAsset.project_id == project_id)
        .order_by(MediaAsset.created_at.desc())
        .all()
    )


@router.post("/upload", response_model=MediaAssetOut, status_code=status.HTTP_201_CREATED)
async def upload_media(
    project_id: str,
    file: UploadFile,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> MediaAsset:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Unsupported file type")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")

    project_dir = settings.media_storage_dir / project_id
    project_dir.mkdir(parents=True, exist_ok=True)

    suffix = Path(file.filename or "").suffix
    stored_name = f"{uuid.uuid4()}{suffix}"
    (project_dir / stored_name).write_bytes(contents)

    asset = MediaAsset(
        project_id=project_id,
        filename=file.filename or stored_name,
        content_type=file.content_type or "",
        url=f"/media/{project_id}/{stored_name}",
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset


@router.patch("/{media_id}", response_model=MediaAssetOut)
def update_tags(
    project_id: str,
    media_id: str,
    payload: MediaTagsUpdate,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> MediaAsset:
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id, MediaAsset.project_id == project_id).first()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media asset not found")
    asset.tags = payload.tags
    db.commit()
    db.refresh(asset)
    return asset


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_media(
    project_id: str,
    media_id: str,
    db: Session = Depends(get_db),
    membership: ProjectMember = Depends(require_editor),
) -> None:
    asset = db.query(MediaAsset).filter(MediaAsset.id == media_id, MediaAsset.project_id == project_id).first()
    if asset is not None:
        stored_name = asset.url.rsplit("/", 1)[-1]
        file_path = settings.media_storage_dir / project_id / stored_name
        db.delete(asset)
        db.commit()
        try:
            file_path.unlink(missing_ok=True)
        except OSError:
            pass
