import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "qwen/qwen3-next-80b-a3b-instruct:free")
    SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-me-in-production")
    ALGORITHM = "HS256"
    DB_PATH = os.path.join(os.path.dirname(__file__), "database.db")

settings = Settings()
