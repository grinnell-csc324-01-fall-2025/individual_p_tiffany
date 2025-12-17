from pydantic import BaseModel

# 已有的用户相关 schema（你如果已经写过就不要重复）
class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# 🆕 情绪分析输入输出
class AnalyzeIn(BaseModel):
    text: str

class AnalyzeOut(BaseModel):
    emotion: str
    confidence: float

# Chat input with tone
class ChatDemoIn(BaseModel):
    text: str
    tone: str | None = "calming"

class ChatDemoOut(BaseModel):
    emotions: dict
    guidance: str
    risk: bool | None = None

# 情绪记录（mood）相关
class MoodIn(BaseModel):
    emotion: str
    note: str | None = None

# Allow frontend to send mood_score or emotion
class MoodCreateFlexible(BaseModel):
    emotion: str | None = None
    mood_score: int | None = None
    note: str | None = None

class MoodOut(BaseModel):
    id: int
    emotion: str
    note: str | None = None
    date: str | None = None
    mood_score: int | None = None
