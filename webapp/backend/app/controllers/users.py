from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.schemas.user import UserDB
from app.services.users import UserService
from app.services.auth import get_current_user
from app.utils.logger import logger

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = 0, 
    limit: int = 100,
    current_user: UserDB = Depends(get_current_user)
):
    logger.info("Fetching users")
    return await UserService.get_all_users(skip=skip, limit=limit)

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: UserDB = Depends(get_current_user)
):
    return current_user

@router.get("/{id}", response_model=UserResponse)
async def get_user(
    id: str,
    current_user: UserDB = Depends(get_current_user)
):
    user = await UserService.get_user_by_id(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    current_user: UserDB = Depends(get_current_user)
):
    user = await UserService.get_user_by_email(user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return await UserService.create_user(user_in)

@router.put("/{id}", response_model=UserResponse)
async def update_user(
    id: str,
    user_in: UserUpdate,
    current_user: UserDB = Depends(get_current_user)
):
    user = await UserService.update_user(id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    id: str,
    current_user: UserDB = Depends(get_current_user)
):
    success = await UserService.delete_user(id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
