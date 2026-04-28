from fastapi import FastAPI

app = FastAPI(
    title="AI Backend Starter jm",
    description="AI 学习助手后端服务脚手架",
    version="0.1.0",
)

@app.get("/")
def read_root():
    return{
        "message": "Hi JM happy everyDay!",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return{
        "status":"ok",
        "service": "ai-backend-starter"
    }

@app.get("/jm")
def jm():
    return{
        "message": "OK jm",
        "service":"ai-jm"
    }

