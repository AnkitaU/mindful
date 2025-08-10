from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import GoalCreate, Goal, GoalWithHabits, Habit
from app.database import database as db
from app.ai_service import generate_habit_plan
from app.auth import get_current_user
from app.models import User
import datetime
from bson import ObjectId

router = APIRouter()

@router.post("", response_model=GoalWithHabits)
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
        "user_id": current_user.id,
    }
    result = await db.goals.insert_one(goal_doc)
    goal_id = result.inserted_id

    # 3. Save the habits to the database
    habits_to_create = []
    for habit_data in habits_data:
        habit_doc = {
            "description": habit_data["description"],
            "frequency": habit_data["frequency"],
            "goal_id": goal_id,
        }
        habits_to_create.append(habit_doc)
    
    if habits_to_create:
        await db.habits.insert_many(habits_to_create)

    # 4. Return the created goal with habits
    created_goal = await db.goals.find_one({"_id": goal_id})
    habits_cursor = db.habits.find({"goal_id": goal_id})
    habits = await habits_cursor.to_list(length=100)
    
    return GoalWithHabits(**created_goal, habits=habits)

@router.get("", response_model=List[GoalWithHabits])
async def get_goals(current_user: User = Depends(get_current_user)):
    goals_cursor = db.goals.find({"user_id": current_user.id})
    goals = await goals_cursor.to_list(length=100)
    
    goals_with_habits = []
    for goal in goals:
        habits_cursor = db.habits.find({"goal_id": goal["_id"]})
        habits = await habits_cursor.to_list(length=100)
        goals_with_habits.append(GoalWithHabits(**goal, habits=habits))
        
    return goals_with_habits