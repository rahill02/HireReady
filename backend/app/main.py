from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routes import auth, profile, interviews, analytics, resume

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Runs on startup
    await connect_db()
    yield
    # Runs on shutdown
    await close_db()

app = FastAPI(
    title="AI Interview Platform",
    description="Backend API for AI-powered interview preparation",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "http://localhost:5174",
                   ],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(interviews.router)
app.include_router(analytics.router)
app.include_router(resume.router)





@app.get("/")
async def root():
    return {"message": "AI Interview Platform API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}