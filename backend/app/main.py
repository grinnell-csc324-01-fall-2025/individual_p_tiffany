from fastapi import FastAPI
from .routers import health, auth, chat, mood
from .db import Base, engine

app = FastAPI()

# 注册路由
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(mood.router)

# 只有当 engine 存在时才尝试创建数据库表
if engine is not None:
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created.")
    except Exception as e:
        print("⚠️ Skipped creating database tables.")
        print("Error:", e)
else:
    print("⚠️ No database engine, skipping table creation.")

@app.get("/")
def root():
    return {"ok": True, "service": "ai-therapy-api"}
