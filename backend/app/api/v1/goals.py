from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import GoalCreate, Goal, GoalWithHabits, Habit, GoalUpdate
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

@router.put("/{goal_id}", response_model=GoalWithHabits)
async def update_goal(
    goal_id: str,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user)
):
    # 1. Find the goal and check ownership
    try:
        obj_goal_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    existing_goal = await db.goals.find_one({"_id": obj_goal_id, "user_id": current_user.id})
    if not existing_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # 2. Update the goal description
    await db.goals.update_one(
        {"_id": obj_goal_id},
        {"$set": {"description": goal_update.description}}
    )

    # 3. Delete old habits
    await db.habits.delete_many({"goal_id": obj_goal_id})

    # 4. Get new habit plan from AI service
    habits_data = generate_habit_plan(goal_update.description)
    if not habits_data:
        raise HTTPException(status_code=500, detail="Failed to generate new habit plan")

    # 5. Save the new habits to the database
    habits_to_create = []
    for habit_data in habits_data:
        habit_doc = {
            "description": habit_data["description"],
            "frequency": habit_data["frequency"],
            "goal_id": obj_goal_id,
        }
        habits_to_create.append(habit_doc)
    
    if habits_to_create:
        await db.habits.insert_many(habits_to_create)

    # 6. Return the updated goal with new habits
    updated_goal = await db.goals.find_one({"_id": obj_goal_id})
    habits_cursor = db.habits.find({"goal_id": obj_goal_id})
    habits = await habits_cursor.to_list(length=100)
    
    return GoalWithHabits(**updated_goal, habits=habits)

@router.delete("/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user)
):
    # 1. Find the goal and check ownership
    try:
        obj_goal_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    existing_goal = await db.goals.find_one({"_id": obj_goal_id, "user_id": current_user.id})
    if not existing_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # 2. Delete the goal and its associated habits
    await db.habits.delete_many({"goal_id": obj_goal_id})
    await db.goals.delete_one({"_id": obj_goal_id})

    return