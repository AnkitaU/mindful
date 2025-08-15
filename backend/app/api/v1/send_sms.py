from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class SMSPayload(BaseModel):
    phone_number: str
    message: str


@router.post("/send-sms/")
async def send_sms(payload: SMSPayload):
    if not payload.phone_number or not payload.message:
        raise HTTPException(status_code=400, detail="Phone number and message are required.")
    print(f"Sending SMS to {payload.phone_number}: {payload.message}")
    return {"message": "SMS sent successfully"}