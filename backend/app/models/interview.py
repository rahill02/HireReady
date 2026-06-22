from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InterviewCreate(BaseModel):
    topic: str
    difficulty: str  # "easy" | "medium" | "hard"
    num_questions: int = 5

class QuestionAnswer(BaseModel):
    question_text: str
    user_answer: Optional[str] = None
    ai_feedback: Optional[str] = None
    score: Optional[float] = None

class InterviewResponse(BaseModel):
    id: str
    topic: str
    difficulty: str
    questions: list[QuestionAnswer]
    total_score: Optional[float] = None
    status: str
    started_at: datetime