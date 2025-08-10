from fastapi import APIRouter, Depends, HTTPException, status
from app.models import UserCreate, User
from app.auth import get_password_hash
from app.database import get_database
from pymongo.database import Database
from datetime import datetime

router = APIRouter()

@router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Database = Depends(get_database)):
    try:
        user_dict = user.dict()
        # Check if user already exists
        if await db.users.find_one({"email": user_dict["email"]}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        hashed_password = get_password_hash(user_dict["password"])
        user_doc = {
            "email": user_dict["email"],
            "hashed_password": hashed_password,
            "createdAt": datetime.utcnow(),
        }
        
        result = await db.users.insert_one(user_doc)
        created_user = await db.users.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for proper serialization
        created_user["_id"] = str(created_user["_id"])
        
        return User(**created_user)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error during registration: {str(e)}"
        )

from fastapi.security import OAuth2PasswordRequestForm
from app.auth import verify_password, create_access_token
from app.models import Token
from datetime import timedelta

ACCESS_TOKEN_EXPIRE_MINUTES = 30

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Database = Depends(get_database)
):
    user = await db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}



