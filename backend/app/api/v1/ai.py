from fastapi import APIRouter, Depends, HTTPException
from app import models, auth
from app.database import database as db
from app.ai_service import generate_habit_plan
import json

router = APIRouter()

@router.post("/assist")
async def assist(request: models.AIAssistRequest, current_user: models.User = Depends(auth.get_current_user)):
    prompt = request.prompt.lower()

    try:
        if prompt == "go to to-do":
            return {"redirect": "/?tab=todos"}
        elif prompt.startswith("edit habits for"):
            # This is a simplified example. In a real application, you'd
            # likely need to identify the specific goal to edit.
            return {"redirect": "/edit-habits"}
        elif prompt == "create new goal":
            return {"redirect": "/new-goal"}
        elif prompt == "go to dashboard":
            return {"redirect": "/"}
        else:
            return {"response": "I cannot complete this request."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))