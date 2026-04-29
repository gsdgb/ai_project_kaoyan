import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "AI Backend Starter")
    APP_VERSION: str = os.getenv("APP_VERSION", "0.2.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "./todo.db")


settings = Settings()