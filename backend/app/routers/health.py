from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])

@router.get("")
def ok():
    return {"status": "survining and we are on day two now!!!"}
