import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.generate import router as generate_router

app = FastAPI(
    title="AI Comic Generator API",
    description="API nhận prompt để generate comic",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(generate_router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",
        port=3000,
        reload=True,
    )
