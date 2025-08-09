from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import GoalCreate, Goal, Habit, HabitCreate
from app.database import db
from app.ai_service import generate_habit_plan
from app.auth import get_current_user
from app.models import User
import datetime

router = APIRouter()

@router.post("/", response_model=Goal)
async def create_goal(
    goal: GoalCreate,
    current_user: User = Depends(get_current_user)
):
    # 1. Get habit plan from AI service
    habits_data = generate_habit_plan(goal.description)
    if not habits_data:
        raise HTTPException(status_code=500, detail="Failed to generate habit plan")

    # 2. Save the goal to the database
    goal_doc = {
        "description": goal.description,
        "userId": current_user.id,
        "createdAt": datetime.datetime.utcnow(),
    }
    result = await db.goals.insert_one(goal_doc)
    goal_id = result.inserted_id

    # 3. Save the habits to the database
    habits_to_create = []
    for habit_data in habits_data:
        habit_doc = {
            "description": habit_data["description"],
            "frequency": habit_data["frequency"],
            "goalId": str(goal_id),
            "createdAt": datetime.datetime.utcnow(),
        }
        habits_to_create.append(habit_doc)

    if habits_to_create:
        await db.habits.insert_many(habits_to_create)

    # 4. Return the created goal
    created_goal = await db.goals.find_one({"_id": goal_id})
    return Goal(**created_goal)