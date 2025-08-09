import os
from fastapi import FastAPI
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

app = FastAPI()

@app.on_event("startup")
def startup_db_client():
    app.mongodb_client = MongoClient(os.getenv("DATABASE_URL"))
    app.database = app.mongodb_client.get_database("habit_builder")
    print("Connected to the MongoDB database.")

@app.on_event("shutdown")
def shutdown_db_client():
    app.mongodb_client.close()

@app.get("/api/v1/health")
def read_root():
    return {"status": "ok"}