from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str = Field(..., alias="_id")
    hashed_password: str
    createdAt: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class GoalBase(BaseModel):
    description: str

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: str = Field(..., alias="_id")
    userId: str
    createdAt: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }

class HabitBase(BaseModel):
    description: str
    frequency: str # "daily" or "weekly"

class HabitCreate(HabitBase):
    pass

class Habit(HabitBase):
    id: str = Field(..., alias="_id")
    goalId: str
    createdAt: datetime

    class Config:
        orm_mode = True
        allow_population_by_field_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
        }