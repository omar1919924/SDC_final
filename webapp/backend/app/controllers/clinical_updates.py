from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.clinical_update import ClinicalUpdateCreate, ClinicalUpdateResponse
from app.schemas.user import UserDB
from app.services.clinical_updates import ClinicalUpdateService
from app.utils.dependencies import RoleChecker
from app.utils.logger import logger

router = APIRouter(prefix="/clinical-updates", tags=["clinical-updates"])

@router.get("/{child_id}", response_model=List[ClinicalUpdateResponse])
async def get_child_updates(
    child_id: str,
    current_user: UserDB = Depends(RoleChecker(["parent", "enseignant", "admin"]))
):
    logger.info(f"Fetching clinical updates for child {child_id}")
    updates = await ClinicalUpdateService.get_updates_by_child_id(child_id)
    return updates

@router.post("", response_model=ClinicalUpdateResponse, status_code=status.HTTP_201_CREATED)
async def create_update(
    update_in: ClinicalUpdateCreate,
    current_user: UserDB = Depends(RoleChecker(["enseignant", "admin"]))
):
    """
    Only Teachers and Admins can post clinical updates.
    """
    logger.info(f"Creating new clinical update for child {update_in.child_id}")
    new_update = await ClinicalUpdateService.create_update(update_in)
    if not new_update:
        raise HTTPException(status_code=500, detail="Failed to create clinical update")
    return new_update
