from typing import Optional
from bson import ObjectId
from app.database.mongodb import get_database
from app.schemas.child import ChildCreate, ChildDB

class ChildService:
    collection_name = "children"

    @classmethod
    async def get_collection(cls):
        db = get_database()
        return db[cls.collection_name]

    @classmethod
    async def create_child(cls, child: ChildCreate) -> ChildDB:
        collection = await cls.get_collection()
        child_db = ChildDB(**child.model_dump())
        result = await collection.insert_one(child_db.model_dump(by_alias=True, exclude={"id"}))
        child_db.id = result.inserted_id
        return child_db

    @classmethod
    async def get_child_by_user_id(cls, user_id: str) -> Optional[ChildDB]:
        collection = await cls.get_collection()
        child_dict = await collection.find_one({"user_id": user_id})
        if child_dict:
            return ChildDB(**child_dict)
        return None

    @classmethod
    async def get_all_children(cls, skip: int = 0, limit: int = 100) -> list[ChildDB]:
        collection = await cls.get_collection()
        children = []
        cursor = collection.find({}).skip(skip).limit(limit)
        async for document in cursor:
            children.append(ChildDB(**document))
        return children

    @classmethod
    async def get_child_by_id(cls, child_id: str) -> Optional[ChildDB]:
        if not ObjectId.is_valid(child_id):
            return None
        collection = await cls.get_collection()
        child_dict = await collection.find_one({"_id": ObjectId(child_id)})
        if child_dict:
            return ChildDB(**child_dict)
        return None

    @classmethod
    async def update_child(cls, child_id: str, child_update: dict) -> Optional[ChildDB]:
        if not ObjectId.is_valid(child_id):
            return None
        collection = await cls.get_collection()
        if not child_update:
            return await cls.get_child_by_id(child_id)
            
        await collection.update_one({"_id": ObjectId(child_id)}, {"$set": child_update})
        return await cls.get_child_by_id(child_id)

    @classmethod
    async def delete_child(cls, child_id: str) -> bool:
        if not ObjectId.is_valid(child_id):
            return False
        collection = await cls.get_collection()
        result = await collection.delete_one({"_id": ObjectId(child_id)})
        return result.deleted_count > 0
