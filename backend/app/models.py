from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime
from typing import Optional
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, _):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    createdAt: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
        }

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Habit(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    description: str
    frequency: str # e.g., "daily", "weekly"
    goal_id: PyObjectId = Field(...)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class Goal(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    description: str
    user_id: PyObjectId = Field(...)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

class TodoUpdate(BaseModel):
    completed: bool

class GoalCreate(BaseModel):
    description: str

class GoalWithHabits(Goal):
    habits: list[Habit]

class HabitCreate(BaseModel):
    description: str
    frequency: str

class GoalUpdate(BaseModel):
    description: Optional[str] = None
    habits: Optional[list[HabitCreate]] = None

class Todo(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    description: str
    completed: bool = False
    due_date: datetime
    user_id: PyObjectId = Field(...)
    habit_id: Optional[PyObjectId] = Field(None)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}