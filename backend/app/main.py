from fastapi import FastAPI
from .routers import health, auth, chat, mood
from .routers import conversations
from .db import Base, engine
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(mood.router)
app.include_router(conversations.router)

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
    """
    Root endpoint for service health check.

    Returns:
        dict: A simple JSON response indicating the service is running.
    """
    return {"Welcome! It's not done yet, but finger crossed it works at the end.": True, "service": "ai-therapy-api"}
