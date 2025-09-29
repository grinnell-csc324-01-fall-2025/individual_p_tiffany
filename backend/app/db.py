from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from a .env file
load_dotenv()

# Fallback to a default local PostgreSQL database if DATABASE_URL is not set
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://tangyixu:0048@localhost:5432/ai_therapy"
)

# Establish database connection
engine = None
SessionLocal = None

try:
    # 尝试创建数据库引擎
    engine = create_engine(DATABASE_URL, echo=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("✅ Database engine created successfully.")
except Exception as e:
    print("⚠️ Database not available, skipping connection.")
    print("Error:", e)

# ORM模型基类
Base = declarative_base()

from sqlalchemy.orm import Session

# ORM模型基类
Base = declarative_base()

# FastAPI 依赖 - 获取数据库会话
def get_db():
    db = None
    if SessionLocal is not None:
        db = SessionLocal()
    try:
        yield db
    finally:
        if db is not None:
            db.close()

