from typing import List, Optional
from app.database.mongodb import get_database
from app.schemas.clinical_update import ClinicalUpdateCreate, ClinicalUpdateDB
from app.utils.logger import logger

class ClinicalUpdateService:
    collection_name = "clinical_updates"

    @classmethod
    async def get_collection(cls):
        db = get_database()
        return db[cls.collection_name]

    @classmethod
    async def create_update(cls, update_data: ClinicalUpdateCreate) -> Optional[ClinicalUpdateDB]:
        try:
            collection = await cls.get_collection()
            update_dict = update_data.model_dump()
            result = await collection.insert_one(update_dict)
            update_dict["_id"] = result.inserted_id
            return ClinicalUpdateDB(**update_dict)
        except Exception as e:
            logger.error(f"Error creating clinical update: {e}")
            return None

    @classmethod
    async def get_updates_by_child_id(cls, child_id: str) -> List[ClinicalUpdateDB]:
        try:
            collection = await cls.get_collection()
            updates = []
            cursor = collection.find({"child_id": child_id}).sort("timestamp", -1)
            async for doc in cursor:
                updates.append(ClinicalUpdateDB(**doc))
            return updates
        except Exception as e:
            logger.error(f"Error fetching clinical updates for child {child_id}: {e}")
            return []
