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
from ..schemas import AnalyzeIn, AnalyzeOut, ChatDemoIn, ChatDemoOut
from ..services.emotions import analyze
from ..services.llm_client import generate_guidance

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/analyze", response_model=AnalyzeOut)
def analyze_route(in_data: AnalyzeIn):
    # 使用项目现有的情绪分析器并返回情绪与置信度
    emos, risk = analyze(in_data.text)
    # 简化版：返回 top emotion 和置信度（示意）
    top = max(emos, key=emos.get) if emos else "mixed"
    confidence = round(emos.get(top, 0.6), 2) if isinstance(emos, dict) else 0.7
    return {"emotion": top, "confidence": confidence}


@router.post("/demo", response_model=ChatDemoOut)
def analyze_and_guidance(in_data: ChatDemoIn):
    # Demo endpoint: analyze emotions then generate guidance with tone (may call real LLM if enabled)
    emos, risk = analyze(in_data.text)
    tone = in_data.tone or "calming"
    guidance = generate_guidance(in_data.text, emos, tone)
    return {"emotions": emos, "guidance": guidance, "risk": risk}
