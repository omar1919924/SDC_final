from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.child import ChildCreate, ChildResponse, ChildUpdate
from app.schemas.user import UserDB
from app.services.children import ChildService
from app.services.users import UserService
from app.services.auth import get_current_user
from app.utils.dependencies import RoleChecker
from app.utils.logger import logger

router = APIRouter(prefix="/children", tags=["children"])

@router.get("", response_model=List[ChildResponse])
async def get_children(
    skip: int = 0, 
    limit: int = 100,
    current_user: UserDB = Depends(RoleChecker(["enseignant", "parent", "admin"]))
):
    logger.info("Fetching children")
    return await ChildService.get_all_children(skip=skip, limit=limit)

@router.get("/me", response_model=ChildResponse)
async def get_my_child_profile(current_user: UserDB = Depends(RoleChecker(["enfant"]))):
    child = await ChildService.get_child_by_user_id(str(current_user.id))
    if not child:
        # Just-in-Time provisioning: Auto-create the clinical profile if it doesn't exist
        new_child = ChildCreate(user_id=str(current_user.id))
        child = await ChildService.create_child(new_child)
    return child

@router.post("", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
async def create_child(
    child_in: ChildCreate,
    current_user: UserDB = Depends(get_current_user)
):
    user = await UserService.get_user_by_id(child_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Linked User not found")
        
    if child_in.parent_id:
        parent_user = await UserService.get_user_by_id(child_in.parent_id)
        if not parent_user:
            raise HTTPException(status_code=404, detail="Linked Parent User not found")

    existing = await ChildService.get_child_by_user_id(child_in.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Child profile already exists for this user")
        
    return await ChildService.create_child(child_in)

@router.get("/{id}", response_model=ChildResponse)
async def get_child(id: str, current_user: UserDB = Depends(get_current_user)):
    child = await ChildService.get_child_by_id(id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child

@router.put("/{id}", response_model=ChildResponse)
async def update_child(id: str, child_in: ChildUpdate, current_user: UserDB = Depends(get_current_user)):
    update_data = child_in.model_dump(exclude_unset=True)
    child = await ChildService.update_child(id, update_data)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_child(id: str, current_user: UserDB = Depends(get_current_user)):
    success = await ChildService.delete_child(id)
    if not success:
        raise HTTPException(status_code=404, detail="Child not found")
