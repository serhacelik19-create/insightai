import time
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import init_db
from backend.routers.auth import router as auth_router
from backend.routers.profiles import router as profiles_router
from backend.routers.financials import router as financials_router
from backend.routers.analytics import router as analytics_router
from backend.routers.personnel import router as personnel_router
from backend.routers.menu import router as menu_router
from backend.routers.scenarios import router as scenarios_router
from backend.routers.actions import router as actions_router

# Initialize Database on startup if not already existing
init_db()

app = FastAPI(title="Business Analytics API")

# Rate limiting storage
login_rate_limit_store = defaultdict(list)

class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/api/auth/login" and request.method == "POST":
            client_ip = request.client.host if request.client else "unknown"
            now = time.time()
            
            # Periodically sweep stale IPs to prevent unbounded memory growth
            stale_ips = [ip for ip, timestamps in login_rate_limit_store.items() if not [t for t in timestamps if now - t < 60]]
            for ip in stale_ips:
                del login_rate_limit_store[ip]

            login_rate_limit_store[client_ip] = [t for t in login_rate_limit_store[client_ip] if now - t < 60]
            if len(login_rate_limit_store[client_ip]) >= 10:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Çok fazla giriş denemesi yapıldı. Lütfen bir dakika bekleyin."}
                )
            login_rate_limit_store[client_ip].append(now)
        return await call_next(request)

app.add_middleware(RateLimitMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(profiles_router)
app.include_router(financials_router)
app.include_router(analytics_router)
app.include_router(personnel_router)
app.include_router(menu_router)
app.include_router(scenarios_router)
app.include_router(actions_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
