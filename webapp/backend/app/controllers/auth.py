from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserCreate, UserResponse
from app.schemas.auth import Token
from app.services.users import UserService
from app.utils.security import verify_password, create_access_token
from app.utils.logger import logger

router = APIRouter(prefix="/auth", tags=["auth"])

from app.services.teachers import TeacherService
from app.schemas.teacher import TeacherCreate
from app.services.parents import ParentService
from app.schemas.parent import ParentCreate
from app.services.children import ChildService
from app.schemas.child import ChildCreate

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate):
    logger.info(f"Registering user with email {user_in.email}")
    user = await UserService.get_user_by_email(user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this username already exists in the system.",
        )
    
    # 1. Create the core user account
    user_db = await UserService.create_user(user_in)
    user_id_str = str(user_db.id)
    
    # 2. Provision the corresponding clinical/role profile
    try:
        if user_db.role == "enseignant":
            await TeacherService.create_teacher(TeacherCreate(user_id=user_id_str))
        elif user_db.role == "parent":
            await ParentService.create_parent(ParentCreate(user_id=user_id_str))
        elif user_db.role == "enfant":
            await ChildService.create_child(ChildCreate(user_id=user_id_str))
        
        logger.info(f"Successfully provisioned {user_db.role} profile for user {user_id_str}")
    except Exception as e:
        logger.error(f"Failed to provision {user_db.role} profile for user {user_id_str}: {str(e)}")
        
    return user_db

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    logger.info(f"Login attempt for user with email {form_data.username}")
    user = await UserService.get_user_by_email(form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"email": user.email, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}
