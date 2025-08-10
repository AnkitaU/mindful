from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.database import get_database
from app.models import Todo, User, Habit, TodoUpdate
from app.auth import get_current_user
from datetime import datetime, date
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[Todo])
async def get_daily_todos(
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    today = date.today()
    start_of_day = datetime(today.year, today.month, today.day)
    end_of_day = datetime(today.year, today.month, today.day, 23, 59, 59)

    # Fetch all goals for the current user
    goals_cursor = db.goals.find({"user_id": current_user.id})
    goals = await goals_cursor.to_list(length=None)
    goal_ids = [goal["_id"] for goal in goals]

    # Fetch all daily habits for those goals
    habits_cursor = db.habits.find({
        "goal_id": {"$in": goal_ids},
        "frequency": "daily"
    })
    daily_habits = await habits_cursor.to_list(length=None)

    todos = []
    for habit in daily_habits:
        existing_todo = await db.todos.find_one({
            "habit_id": habit["_id"],
            "due_date": {"$gte": start_of_day, "$lte": end_of_day}
        })

        if existing_todo:
            todos.append(Todo(**existing_todo))
        else:
            new_todo = Todo(
                description=habit["description"],
                completed=False,
                due_date=start_of_day,
                user_id=current_user.id,
                habit_id=habit["_id"]
            )
            await db.todos.insert_one(new_todo.dict(by_alias=True))
            todos.append(new_todo)
    
    return todos

@router.put("/{todo_id}", response_model=Todo)
async def update_todo(
    todo_id: str,
    todo_update: TodoUpdate,
    db=Depends(get_database),
    current_user: User = Depends(get_current_user),
):
    todo_object_id = ObjectId(todo_id)
    
    updated_todo = await db.todos.find_one_and_update(
        {"_id": todo_object_id, "user_id": current_user.id},
        {"$set": {"completed": todo_update.completed}},
        return_document=True
    )

    if updated_todo:
        return Todo(**updated_todo)
    else:
        raise HTTPException(status_code=404, detail="Todo not found")
