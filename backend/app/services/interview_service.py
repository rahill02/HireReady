from datetime import datetime
from bson import ObjectId
from app.database import get_db
from app.services.ai_service import generate_interview_questions, evaluate_answer
from fastapi import HTTPException

async def create_interview(
    user_id: str,
    topic: str,
    difficulty: str,
    num_questions: int,
    target_role: str,
    skills: list[str]
) -> dict:
    db = get_db()

    try:
        questions = await generate_interview_questions(
            topic=topic,
            difficulty=difficulty,
            num_questions=num_questions,
            target_role=target_role,
            skills=skills
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate questions: {str(e)}"
        )

    interview_doc = {
        "user_id": user_id,
        "topic": topic,
        "difficulty": difficulty,
        "questions": [
            {
                "question_text": q["question_text"],
                "user_answer": None,
                "ai_feedback": None,
                "score": None
            }
            for q in questions
        ],
        "total_score": None,
        "status": "in_progress",
        "started_at": datetime.utcnow(),
        "completed_at": None
    }

    result = await db.interviews.insert_one(interview_doc)
    interview_doc["id"] = str(result.inserted_id)
    return interview_doc


async def get_interview(interview_id: str, user_id: str) -> dict:
    db = get_db()

    interview = await db.interviews.find_one({
        "_id": ObjectId(interview_id),
        "user_id": user_id
    })

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Convert ObjectId to string so FastAPI can serialize it
    interview["_id"] = str(interview["_id"])
    interview["id"] = interview["_id"]
    return interview


async def evaluate_and_complete(interview_id: str, user_id: str) -> dict:
    db = get_db()

    interview = await get_interview(interview_id, user_id)

    topic = interview["topic"]
    difficulty = interview["difficulty"]
    questions = interview["questions"]

    total_score = 0
    evaluated_questions = []

    for i, q in enumerate(questions):
        answer = q.get("user_answer") or ""

        # If user skipped the question, give a default feedback
        if not answer.strip():
            evaluated_questions.append({
                **q,
                "ai_feedback": "No answer provided.",
                "correct_points": "N/A",
                "improvement": "Make sure to attempt every question.",
                "score": 0
            })
            continue

        try:
            evaluation = await evaluate_answer(
                question=q["question_text"],
                user_answer=answer,
                topic=topic,
                difficulty=difficulty
            )
            evaluated_questions.append({
                **q,
                "ai_feedback": evaluation.get("feedback", ""),
                "correct_points": evaluation.get("correct_points", ""),
                "improvement": evaluation.get("improvement", ""),
                "score": evaluation.get("score", 0)
            })
            total_score += evaluation.get("score", 0)
        except Exception:
            evaluated_questions.append({
                **q,
                "ai_feedback": "Evaluation failed for this question.",
                "correct_points": "",
                "improvement": "",
                "score": 0
            })

    avg_score = round(total_score / len(questions), 1) if questions else 0

    # Save everything back to MongoDB
    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {
            "questions": evaluated_questions,
            "total_score": avg_score,
            "status": "completed",
            "completed_at": datetime.utcnow()
        }}
    )

    return {
        "interview_id": interview_id,
        "total_score": avg_score,
        "status": "completed"
    }