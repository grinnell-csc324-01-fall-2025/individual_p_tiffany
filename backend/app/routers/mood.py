from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from ..schemas import MoodIn, MoodOut, MoodCreateFlexible
from ..models import MoodEntry, User
from ..db import get_db

router = APIRouter()

@router.post("/mood", response_model=MoodOut)
def create_mood(entry: MoodCreateFlexible, db: Session = Depends(get_db)):
    from datetime import datetime
    
    emotion = entry.emotion
    score = entry.mood_score
    if emotion is None and score is not None:
        # map scores to labels for readability
        score_map = {
            5: "excellent",
            4: "good",
            3: "neutral",
            2: "poor",
            1: "very_poor",
        }
        emotion = score_map.get(score, str(score))
    
    date_str = datetime.utcnow().date().isoformat()
    
    if db is None:
        # If no database, return mock response
        return MoodOut(id=0, emotion=emotion or "", note=entry.note, date=date_str, mood_score=score)
    
    # Create and save entry
    new_entry = MoodEntry(emotion=emotion or "", note=entry.note, user_id=1, created_at=date_str)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return MoodOut(id=new_entry.id, emotion=new_entry.emotion, note=new_entry.note, date=new_entry.created_at, mood_score=score)


@router.get("/mood", response_model=List[MoodOut])
def list_mood(db: Session = Depends(get_db)):
    if db is None:
        return []
    
    rows = db.query(MoodEntry).order_by(MoodEntry.id.desc()).limit(50).all()
    
    # Build output including date and inferred mood_score
    score_map_rev = {
        "excellent": 5,
        "good": 4,
        "neutral": 3,
        "poor": 2,
        "very_poor": 1,
    }
    
    out = []
    for r in rows:
        score = score_map_rev.get(r.emotion)
        if score is None:
            try:
                score = int(r.emotion)
            except (ValueError, TypeError):
                pass
        
        out.append(MoodOut(
            id=r.id,
            emotion=r.emotion,
            note=r.note,
            date=getattr(r, "created_at", None),
            mood_score=score,
        ))
    return out
