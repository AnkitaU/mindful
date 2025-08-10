import os
import urllib.parse
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

def get_mongo_url():
    username = os.getenv("MONGO_USERNAME")
    password = os.getenv("MONGO_PASSWORD")
    host = os.getenv("MONGO_HOST")
    
    encoded_password = urllib.parse.quote_plus(password)
    
    return f"mongodb+srv://{username}:{encoded_password}@{host}/?retryWrites=true&w=majority&appName=Cluster0"

MONGO_DETAILS = get_mongo_url()

client = AsyncIOMotorClient(MONGO_DETAILS)

database = client.habit_builder

user_collection = database.get_collection("users")

async def get_database():
    return database
