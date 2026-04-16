from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.teacher import TeacherCreate, TeacherResponse, TeacherUpdate
from app.schemas.user import UserDB
from app.services.teachers import TeacherService
from app.services.users import UserService
from app.services.auth import get_current_user
from app.utils.dependencies import RoleChecker
from app.utils.logger import logger

router = APIRouter(prefix="/teachers", tags=["teachers"])

@router.get("", response_model=List[TeacherResponse])
async def get_teachers(
    skip: int = 0, 
    limit: int = 100,
    current_user: UserDB = Depends(RoleChecker(["admin"]))
):
    logger.info("Fetching teachers")
    return await TeacherService.get_all_teachers(skip=skip, limit=limit)

@router.get("/me", response_model=TeacherResponse)
async def get_my_teacher_profile(current_user: UserDB = Depends(RoleChecker(["enseignant"]))):
    teacher = await TeacherService.get_teacher_by_user_id(str(current_user.id))
    if not teacher:
        from app.schemas.teacher import TeacherCreate
        new_teacher = TeacherCreate(user_id=str(current_user.id))
        teacher = await TeacherService.create_teacher(new_teacher)
    return teacher

@router.post("", response_model=TeacherResponse, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    teacher_in: TeacherCreate,
    current_user: UserDB = Depends(get_current_user)
):
    user = await UserService.get_user_by_id(teacher_in.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Linked User not found")
    
    existing = await TeacherService.get_teacher_by_user_id(teacher_in.user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Teacher profile already exists for this user")
        
    return await TeacherService.create_teacher(teacher_in)

@router.get("/{id}", response_model=TeacherResponse)
async def get_teacher(id: str, current_user: UserDB = Depends(get_current_user)):
    teacher = await TeacherService.get_teacher_by_id(id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.put("/{id}", response_model=TeacherResponse)
async def update_teacher(id: str, teacher_in: TeacherUpdate, current_user: UserDB = Depends(get_current_user)):
    update_data = teacher_in.model_dump(exclude_unset=True)
    teacher = await TeacherService.update_teacher(id, update_data)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_teacher(id: str, current_user: UserDB = Depends(get_current_user)):
    success = await TeacherService.delete_teacher(id)
    if not success:
        raise HTTPException(status_code=404, detail="Teacher not found")
