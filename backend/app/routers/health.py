from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import SessionLocal

router = APIRouter(prefix="/health", tags=["health"])

# Datebase dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("")
def health_check(db: Session = Depends(get_db)):
    try:
        # 尝试执行一个简单的查询来检查数据库连接
        db.execute("SELECT 1")
        db_ok = True
    except Exception:
        db_ok = False

    return {
        "status": "ok" if db_ok else "error",
        "db": db_ok,
        "service": "ai-therapy-api"
    }
