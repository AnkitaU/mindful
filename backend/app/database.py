import os
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_DETAILS)

database = client.habit_builder

user_collection = database.get_collection("users")

def get_database():
    return database