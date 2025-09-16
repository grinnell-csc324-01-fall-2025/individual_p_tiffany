from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "AI Therapy Prototype"
    debug: bool = True

settings = Settings()