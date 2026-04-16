from typing import Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.schemas.user import UserCreate, UserDB, UserUpdate
from app.utils.security import get_password_hash

class UserService:
    collection_name = "users"

    @classmethod
    async def get_collection(cls):
        db = get_database()
        return db[cls.collection_name]

    @classmethod
    async def get_user_by_email(cls, email: str) -> Optional[UserDB]:
        collection = await cls.get_collection()
        user_dict = await collection.find_one({"email": email})
        if user_dict:
            return UserDB(**user_dict)
        return None

    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[UserDB]:
        if not ObjectId.is_valid(user_id):
            return None
        collection = await cls.get_collection()
        user_dict = await collection.find_one({"_id": ObjectId(user_id)})
        if user_dict:
            return UserDB(**user_dict)
        return None

    @classmethod
    async def create_user(cls, user: UserCreate) -> UserDB:
        collection = await cls.get_collection()
        user_dict = user.model_dump()
        hashed_password = get_password_hash(user_dict.pop("password"))
        user_dict["hashed_password"] = hashed_password
        
        user_db = UserDB(**user_dict)
        # Exclude 'id' (which is the alias for '_id') so MongoDB generates its own
        dump_data = user_db.model_dump(by_alias=True, exclude={"id"})
        result = await collection.insert_one(dump_data)
        user_db.id = result.inserted_id
        return user_db

    @classmethod
    async def get_all_users(cls, skip: int = 0, limit: int = 100) -> list[UserDB]:
        collection = await cls.get_collection()
        users = []
        cursor = collection.find({}).skip(skip).limit(limit)
        async for document in cursor:
            users.append(UserDB(**document))
        return users

    @classmethod
    async def update_user(cls, user_id: str, user_update: UserUpdate) -> Optional[UserDB]:
        if not ObjectId.is_valid(user_id):
            return None
        collection = await cls.get_collection()
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        if not update_data:
            return await cls.get_user_by_id(user_id)
            
        await collection.update_one(
            {"_id": ObjectId(user_id)}, {"$set": update_data}
        )
        return await cls.get_user_by_id(user_id)

    @classmethod
    async def delete_user(cls, user_id: str) -> bool:
        if not ObjectId.is_valid(user_id):
            return False
        collection = await cls.get_collection()
        result = await collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
