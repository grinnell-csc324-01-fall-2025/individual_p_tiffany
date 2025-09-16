from pydantic import BaseModel

# 用户注册请求
class UserCreate(BaseModel):
    username: str
    password: str

# 用户登录请求
class UserLogin(BaseModel):
    username: str
    password: str

# 登录后返回的 token
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
