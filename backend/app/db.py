from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
# 尝试可选加载 .env（如果 python-dotenv 未安装则跳过）
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    print("⚠️  python-dotenv not installed; skipping .env load. Ensure environment variables are set.")

DATABASE_URL = os.getenv("DATABASE_URL")

# 如果没有在环境变量中设置 DATABASE_URL，则为本地开发回退到 sqlite 文件数据库
if not DATABASE_URL:
    print("⚠️  DATABASE_URL not set in .env, falling back to sqlite:///./dev.db for local development")
    DATABASE_URL = "sqlite:///./dev.db"

# 为 sqlite 提供额外的 connect_args（避免多线程问题）
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# 创建数据库引擎（失败时不抛出），便于在未安装或无法连接数据库时仍能启动服务并返回调试信息
try:
    if connect_args:
        engine = create_engine(DATABASE_URL, connect_args=connect_args)
    else:
        engine = create_engine(DATABASE_URL)
    print(f"✅ SQLAlchemy engine created for {DATABASE_URL}")
except Exception as e:
    print("❌ Failed to create SQLAlchemy engine:", e)
    engine = None

# 创建 session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 基类，用于模型继承
Base = declarative_base()

# 提供一个依赖项函数，后面 FastAPI 会用到
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
