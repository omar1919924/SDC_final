import asyncio
import os
import sys

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.services.users import UserService
from app.database.mongodb import connect_to_mongo, close_mongo_connection

async def main():
    await connect_to_mongo()
    try:
        users = await UserService.get_all_users()
        print("EMAILS:", [u.email for u in users])
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
