from fastapi import FastAPI
from api.routes import router

# Khởi tạo App
app = FastAPI(
    title="SmartStudy AI Engine", 
    description="Bộ não xử lý RAG và Chatbot cho hệ thống SmartStudy"
)

# Gắn bộ định tuyến (Router) vào App
app.include_router(router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "AI Engine is running clean and fast!"}