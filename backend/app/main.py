from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import engine, Base
from .routers import health, auth, chat, mood

app = FastAPI(title="AI Therapy Prototype API")

# Create tables on startup (simplest for prototype)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(mood.router)

@app.get("/")
def root():
    return {"ok": True, "service": "ai-therapy-api"}
