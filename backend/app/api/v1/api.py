from fastapi import APIRouter
from app.api.v1 import auth, users, goals, todos, send_sms

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["auth"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(goals.router, prefix="/goals", tags=["goals"])
router.include_router(todos.router, prefix="/todos", tags=["todos"])
router.include_router(send_sms.router, prefix="/sms", tags=["sms"])