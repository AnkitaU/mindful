import os
import urllib.parse
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

def get_mongo_url():
    username = os.getenv("MONGO_USERNAME", "user1")
    password = os.getenv("MONGO_PASSWORD", "13~F43+z^t_6")
    host = os.getenv("MONGO_HOST", "cluster0.svo2eme.mongodb.net")
    
    encoded_password = urllib.parse.quote_plus(password)
    
    return f"mongodb+srv://{username}:{encoded_password}@{host}/?retryWrites=true&w=majority&appName=Cluster0"

MONGO_DETAILS = get_mongo_url()

client = AsyncIOMotorClient(MONGO_DETAILS)

database = client.habit_builder

user_collection = database.get_collection("users")

async def get_database():
    return database
