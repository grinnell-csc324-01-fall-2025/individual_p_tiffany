# from fastapi import APIRouter, Depends, HTTPException, status, Request
# from sqlalchemy.orm import Session
# from ..schemas import AnalyzeIn, AnalyzeOut
# from ..db import get_db
# from ..models import Message, User
# from ..services.emotions import analyze
# from ..services.llm_client import generate_guidance
# from ..config import settings
# from jose import jwt, JWTError

# router = APIRouter(prefix="/chat", tags=["chat"])

# def get_user_from_bearer(request: Request, db: Session) -> User:
#     auth = request.headers.get("authorization", "")
#     if not auth.lower().startswith("bearer "):
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
#     token = auth.split(" ", 1)[1]
#     try:
#         payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
#     except JWTError:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
#     email = payload.get("sub")
#     user = db.query(User).filter(User.email == email).first()
#     if not user:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
#     return user

# @router.post("/analyze", response_model=AnalyzeOut)
# def analyze_chat(body: AnalyzeIn, request: Request, db: Session = Depends(get_db)):
#     user = get_user_from_bearer(request, db)
#     emos, risk = analyze(body.text)
#     # store user message
#     db.add(Message(user_id=user.id, role="client", text=body.text, emotions=emos, risk_flag=risk))
#     guidance = generate_guidance(body.text, emos)
#     # store bot message
#     db.add(Message(user_id=user.id, role="bot", text=guidance, emotions=emos, risk_flag=risk))
#     db.commit()
#     return AnalyzeOut(emotions=emos, guidance=guidance, risk=risk)

from fastapi import APIRouter
from ..schemas import AnalyzeIn, AnalyzeOut
import random

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeOut)
def analyze(in_data: AnalyzeIn):
    # 这里先模拟返回
    emotions = ["joy", "sadness", "anger", "anxiety"]
    emotion = random.choice(emotions)
    return {"emotion": emotion, "confidence": round(random.uniform(0.6, 0.95), 2)}
