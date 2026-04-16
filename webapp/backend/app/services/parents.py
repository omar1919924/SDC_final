from typing import Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.schemas.parent import ParentCreate, ParentDB

class ParentService:
    collection_name = "parents"

    @classmethod
    async def get_collection(cls):
        db = get_database()
        return db[cls.collection_name]

    @classmethod
    async def create_parent(cls, parent: ParentCreate) -> ParentDB:
        collection = await cls.get_collection()
        parent_db = ParentDB(**parent.model_dump())
        result = await collection.insert_one(parent_db.model_dump(by_alias=True, exclude={"id"}))
        parent_db.id = result.inserted_id
        return parent_db

    @classmethod
    async def get_parent_by_user_id(cls, user_id: str) -> Optional[ParentDB]:
        collection = await cls.get_collection()
        parent_dict = await collection.find_one({"user_id": user_id})
        if parent_dict:
            return ParentDB(**parent_dict)
        return None

    @classmethod
    async def get_all_parents(cls, skip: int = 0, limit: int = 100) -> list[ParentDB]:
        collection = await cls.get_collection()
        parents = []
        cursor = collection.find({}).skip(skip).limit(limit)
        async for document in cursor:
            parents.append(ParentDB(**document))
        return parents

    @classmethod
    async def get_parent_by_id(cls, parent_id: str) -> Optional[ParentDB]:
        if not ObjectId.is_valid(parent_id):
            return None
        collection = await cls.get_collection()
        parent_dict = await collection.find_one({"_id": ObjectId(parent_id)})
        if parent_dict:
            return ParentDB(**parent_dict)
        return None

    @classmethod
    async def update_parent(cls, parent_id: str, parent_update: dict) -> Optional[ParentDB]:
        if not ObjectId.is_valid(parent_id):
            return None
        collection = await cls.get_collection()
        if not parent_update:
            return await cls.get_parent_by_id(parent_id)
            
        await collection.update_one({"_id": ObjectId(parent_id)}, {"$set": parent_update})
        return await cls.get_parent_by_id(parent_id)

    @classmethod
    async def delete_parent(cls, parent_id: str) -> bool:
        if not ObjectId.is_valid(parent_id):
            return False
        collection = await cls.get_collection()
        result = await collection.delete_one({"_id": ObjectId(parent_id)})
        return result.deleted_count > 0
