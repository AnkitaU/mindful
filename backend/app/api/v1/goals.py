from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.models import GoalCreate, Goal, GoalWithHabits, Habit, GoalUpdate, Todo, GoalWithProgress, GoalStatusUpdate
from app.database import database as db
from app.ai_service import generate_habit_plan
from app.auth import get_current_user
from app.models import User
from datetime import datetime
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
        "completion_date": goal.completion_date,
        "category": goal.category.value if goal.category else "Other",
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
        habit_results = await db.habits.insert_many(habits_to_create)
        inserted_habit_ids = habit_results.inserted_ids
        
        # 4. Create todos for daily habits
        today = datetime.now().date()
        start_of_day = datetime(today.year, today.month, today.day)
        
        newly_created_habits = await db.habits.find({"_id": {"$in": inserted_habit_ids}}).to_list(length=100)

        for habit in newly_created_habits:
            if habit["frequency"] == "daily":
                new_todo = Todo(
                    description=habit["description"],
                    completed=False,
                    due_date=start_of_day,
                    user_id=current_user.id,
                    habit_id=habit["_id"]
                )
                await db.todos.insert_one(new_todo.dict(by_alias=True))

    # 5. Return the created goal with habits
    created_goal = await db.goals.find_one({"_id": goal_id})
    habits_cursor = db.habits.find({"goal_id": goal_id})
    habits = await habits_cursor.to_list(length=100)
    
    return GoalWithHabits(**created_goal, habits=habits)

@router.get("", response_model=List[GoalWithProgress])
async def get_goals(current_user: User = Depends(get_current_user)):
    goals_cursor = db.goals.find({"user_id": current_user.id})
    goals = await goals_cursor.to_list(length=100)
    
    goals_with_progress = []
    for goal in goals:
        habits_cursor = db.habits.find({"goal_id": goal["_id"]})
        habits = await habits_cursor.to_list(length=100)
        
        total_todos = 0
        completed_todos = 0
        
        habit_ids = [habit["_id"] for habit in habits]
        
        if habit_ids:
            todos_cursor = db.todos.find({"habit_id": {"$in": habit_ids}})
            all_todos = await todos_cursor.to_list(length=None)
            
            total_todos = len(all_todos)
            completed_todos = len([todo for todo in all_todos if todo["completed"]])

        progress = (completed_todos / total_todos) * 100 if total_todos > 0 else 0
        
        goals_with_progress.append(GoalWithProgress(**goal, habits=habits, progress=progress, status=goal.get("status", "in_progress")))
        
    return goals_with_progress

@router.get("/stats", response_model=dict)
async def get_goal_stats(current_user: User = Depends(get_current_user)):
    pipeline = [
        {"$match": {"user_id": current_user.id}},
        {"$group": {"_id": {"$ifNull": ["$category", "Other"]}, "count": {"$sum": 1}}}
    ]
    stats_cursor = db.goals.aggregate(pipeline)
    stats = await stats_cursor.to_list(length=None)
    
    # Convert list of dicts to a single dict
    stats_dict = {item["_id"]: item["count"] for item in stats}
    return stats_dict

@router.get("/{goal_id}", response_model=GoalWithHabits)
async def get_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        obj_goal_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    goal = await db.goals.find_one({"_id": obj_goal_id, "user_id": current_user.id})
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    habits_cursor = db.habits.find({"goal_id": obj_goal_id})
    habits = await habits_cursor.to_list(length=100)
    
    return GoalWithHabits(**goal, habits=habits)

@router.put("/{goal_id}", response_model=GoalWithHabits)
async def update_goal(
    goal_id: str,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        obj_goal_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    existing_goal = await db.goals.find_one({"_id": obj_goal_id, "user_id": current_user.id})
    if not existing_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_fields = {}
    if goal_update.description is not None:
        update_fields["description"] = goal_update.description
    if goal_update.category is not None:
        update_fields["category"] = goal_update.category.value

    if update_fields:
        await db.goals.update_one(
            {"_id": obj_goal_id},
            {"$set": update_fields}
        )

    if goal_update.description:
        await db.habits.delete_many({"goal_id": obj_goal_id})
        habits_data = generate_habit_plan(goal_update.description)
        if not habits_data:
            raise HTTPException(status_code=500, detail="Failed to generate new habit plan")
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

    if goal_update.habits is not None:
        await db.habits.delete_many({"goal_id": obj_goal_id})
        
        habits_to_create = []
        for habit_data in goal_update.habits:
            habit_doc = {
                "description": habit_data.description,
                "frequency": habit_data.frequency,
                "goal_id": obj_goal_id,
            }
            habits_to_create.append(habit_doc)
        
        if habits_to_create:
            await db.habits.insert_many(habits_to_create)

    updated_goal = await db.goals.find_one({"_id": obj_goal_id})
    habits_cursor = db.habits.find({"goal_id": obj_goal_id})
    habits = await habits_cursor.to_list(length=100)
    
    return GoalWithHabits(**updated_goal, habits=habits)

@router.patch("/{goal_id}/status", response_model=Goal)
async def update_goal_status(
    goal_id: str,
    status_update: GoalStatusUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        obj_goal_id = ObjectId(goal_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid goal ID")

    existing_goal = await db.goals.find_one({"_id": obj_goal_id, "user_id": current_user.id})
    if not existing_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.goals.update_one(
        {"_id": obj_goal_id},
        {"$set": {"status": status_update.status}}
    )

    updated_goal = await db.goals.find_one({"_id": obj_goal_id})
    return updated_goal

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