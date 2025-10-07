from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
# 不在模块导入阶段直接导入 SessionLocal，改为在依赖中延迟导入以处理缺少依赖的情况
import traceback

router = APIRouter(prefix="/health", tags=["health"])

# Datebase dependency
def get_db():
    try:
        from ..db import SessionLocal
    except Exception as e:
        # 无法导入 SessionLocal（可能未安装 sqlalchemy 或 db 模块初始化失败）
        print("⚠️ get_db: cannot import SessionLocal:", e)
        # 仍然要作为生成器返回一次 None，这样依赖可以接收 None 并在路由中处理
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass

@router.get("")
def health_check(db: Session = Depends(get_db)):
    error_msg = None
    if db is None:
        db_ok = False
        error_msg = "SessionLocal unavailable (missing SQLAlchemy or DB init error)"
    else:
        try:
            # 尝试执行一个简单的查询来检查数据库连接
            db.execute(text("SELECT 1"))
            db_ok = True
        except Exception as e:
            db_ok = False
            # capture traceback for debugging
            error_msg = "".join(traceback.format_exception_only(type(e), e)).strip()

    resp = {
        "status": "database running" if db_ok else "database error",
        "db": db_ok,
        "service": "ai-therapy-api",
    }

    if error_msg:
        resp["error"] = error_msg

    return resp
