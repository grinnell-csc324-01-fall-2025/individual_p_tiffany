from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from ..schemas import MoodIn, MoodOut
from ..db import get_db
from ..models import MoodEntry, User
from ..config import settings
from jose import jwt, JWTError

router = APIRouter(prefix="/mood", tags=["mood"])

def get_user_from_bearer(request: Request, db: Session) -> User:
    auth = request.headers.get("authorization", "")
    if not auth.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    token = auth.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALG])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user

@router.post("", response_model=MoodOut)
def create_mood(entry: MoodIn, request: Request, db: Session = Depends(get_db)):
    user = get_user_from_bearer(request, db)
    row = MoodEntry(user_id=user.id, mood_score=entry.mood_score, note=entry.note)
    db.add(row)
    db.commit()
    db.refresh(row)
    return MoodOut(id=row.id)

@router.get("")
def list_mood(request: Request, db: Session = Depends(get_db)):
    user = get_user_from_bearer(request, db)
    rows = db.query(MoodEntry).filter(MoodEntry.user_id == user.id).order_by(MoodEntry.date.desc()).limit(50).all()
    return [
        {"id": r.id, "date": str(r.date), "mood_score": r.mood_score, "note": r.note}
        for r in rows
    ]
