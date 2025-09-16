from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..schemas import MoodIn, MoodOut
from ..models import MoodEntry, User
from ..db import get_db

router = APIRouter()

@router.post("/mood", response_model=MoodOut)
def create_mood(entry: MoodIn, db: Session = Depends(get_db)):
    if db is None:
        # 如果没连数据库，也不会崩溃
        return {"id": 0, "emotion": entry.emotion, "note": entry.note}

    new_entry = MoodEntry(emotion=entry.emotion, note=entry.note, user_id=1)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry
