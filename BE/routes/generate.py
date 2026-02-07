from fastapi import APIRouter, HTTPException

from schemas.generate import GenerateRequest
from services.generate_service import generate_images


router = APIRouter(
    prefix="/generate",
    tags=["generate"],
)


@router.post("")
async def generate_comic(request: GenerateRequest):
    try:
        result = generate_images(request)
        return result
    except Exception as e:
        print(f"Lỗi khi xử lý request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
