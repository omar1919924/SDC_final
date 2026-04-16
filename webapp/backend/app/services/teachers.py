from typing import Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.schemas.teacher import TeacherCreate, TeacherDB

class TeacherService:
    collection_name = "teachers"

    @classmethod
    async def get_collection(cls):
        db = get_database()
        return db[cls.collection_name]

    @classmethod
    async def create_teacher(cls, teacher: TeacherCreate) -> TeacherDB:
        collection = await cls.get_collection()
        teacher_db = TeacherDB(**teacher.model_dump())
        result = await collection.insert_one(teacher_db.model_dump(by_alias=True, exclude={"id"}))
        teacher_db.id = result.inserted_id
        return teacher_db

    @classmethod
    async def get_teacher_by_user_id(cls, user_id: str) -> Optional[TeacherDB]:
        collection = await cls.get_collection()
        teacher_dict = await collection.find_one({"user_id": user_id})
        if teacher_dict:
            return TeacherDB(**teacher_dict)
        return None

    @classmethod
    async def get_all_teachers(cls, skip: int = 0, limit: int = 100) -> list[TeacherDB]:
        collection = await cls.get_collection()
        teachers = []
        cursor = collection.find({}).skip(skip).limit(limit)
        async for document in cursor:
            teachers.append(TeacherDB(**document))
        return teachers

    @classmethod
    async def get_teacher_by_id(cls, teacher_id: str) -> Optional[TeacherDB]:
        if not ObjectId.is_valid(teacher_id):
            return None
        collection = await cls.get_collection()
        teacher_dict = await collection.find_one({"_id": ObjectId(teacher_id)})
        if teacher_dict:
            return TeacherDB(**teacher_dict)
        return None

    @classmethod
    async def update_teacher(cls, teacher_id: str, teacher_update: dict) -> Optional[TeacherDB]:
        if not ObjectId.is_valid(teacher_id):
            return None
        collection = await cls.get_collection()
        if not teacher_update:
            return await cls.get_teacher_by_id(teacher_id)
            
        await collection.update_one({"_id": ObjectId(teacher_id)}, {"$set": teacher_update})
        return await cls.get_teacher_by_id(teacher_id)

    @classmethod
    async def delete_teacher(cls, teacher_id: str) -> bool:
        if not ObjectId.is_valid(teacher_id):
            return False
        collection = await cls.get_collection()
        result = await collection.delete_one({"_id": ObjectId(teacher_id)})
        return result.deleted_count > 0
