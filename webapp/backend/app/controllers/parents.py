from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.parent import ParentCreate, ParentResponse, ParentUpdate
from app.schemas.user import UserDB
from app.services.parents import ParentService
from app.services.users import UserService
from app.services.auth import get_current_user
from app.utils.dependencies import RoleChecker
from app.utils.logger import logger

router = APIRouter(prefix="/parents", tags=["parents"])

@router.get("", response_model=List[ParentResponse])
async def get_parents(
    skip: int = 0, 
    limit: int = 100,
    current_user: UserDB = Depends(RoleChecker(["admin", "enseignant"]))
):
    logger.info("Fetching parents")
    return await ParentService.get_all_parents(skip=skip, limit=limit)

@router.get("/me", response_model=ParentResponse)
async def get_my_parent_profile(current_user: UserDB = Depends(RoleChecker(["parent"]))):
    parent = await ParentService.get_parent_by_user_id(str(current_user.id))
    if not parent:
        from app.schemas.parent import ParentCreate
        new_parent = ParentCreate(user_id=str(current_user.id))
        parent = await ParentService.create_parent(new_parent)
    return parent

@router.post("", response_model=ParentResponse, status_code=status.HTTP_201_CREATED)
async def create_parent(
    parent_in: ParentCreate,
    current_user: UserDB = Depends(get_current_user)
):
    user = await UserService.get_user_by_id(parent_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Linked User not found")
    
    existing = await ParentService.get_parent_by_user_id(parent_in.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Parent profile already exists for this user")
        
    if parent_in.enfant_id:
        child_user = await UserService.get_user_by_id(parent_in.enfant_id)
        if not child_user:
            raise HTTPException(status_code=404, detail=f"Child User not found with id {parent_in.enfant_id}")

    return await ParentService.create_parent(parent_in)

@router.get("/{id}", response_model=ParentResponse)
async def get_parent(id: str, current_user: UserDB = Depends(get_current_user)):
    parent = await ParentService.get_parent_by_id(id)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent

@router.put("/{id}", response_model=ParentResponse)
async def update_parent(id: str, parent_in: ParentUpdate, current_user: UserDB = Depends(get_current_user)):
    update_data = parent_in.model_dump(exclude_unset=True)
    parent = await ParentService.update_parent(id, update_data)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent not found")
    return parent

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parent(id: str, current_user: UserDB = Depends(get_current_user)):
    success = await ParentService.delete_parent(id)
    if not success:
        raise HTTPException(status_code=404, detail="Parent not found")
