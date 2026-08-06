import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.db.database import engine
from app.core.config import settings
from app.api.user import router as user_router
from app.api.ticket import router as ticket_router
from app.api.admin import router as admin_router

app = FastAPI(
    title="Real-Time Ticketing System API",
    description="A help desk and ticket management system built with FastAPI.",
    version="1.0.0",
)

# CORS Configuration
# FRONTEND_URL env var is set in Render to your deployed frontend URL
_frontend_url = os.getenv("FRONTEND_URL", "")
allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
if _frontend_url:
    allow_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)
app.include_router(ticket_router)
app.include_router(admin_router)



@app.get("/")
def root():
    return {
        "message": "Welcome to Real-Time Ticketing System API",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    # Mask password in URL for safe display
    db_url = settings.DATABASE_URL
    try:
        at = db_url.index("@")
        display_url = "postgresql://***:***@" + db_url[at + 1:]
    except Exception:
        display_url = "(could not parse URL)"

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": display_url}
    except Exception as e:
        return {"status": "error", "database": display_url, "detail": str(e)}