from fastapi import APIRouter, Depends, HTTPException
from app.utils.dependencies import get_current_user, get_db
from app.models.interview import InterviewCreate
from app.services.interview_service import create_interview, get_interview
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/interviews", tags=["Interviews"])

class AnswerSubmit(BaseModel):
    question_index: int
    answer: str

@router.post("/create")
async def create_new_interview(
    data: InterviewCreate,
    current_user=Depends(get_current_user)
):
    interview = await create_interview(
        user_id=str(current_user["_id"]),
        topic=data.topic,
        difficulty=data.difficulty,
        num_questions=data.num_questions,
        target_role=current_user.get("target_role", "fullstack"),
        skills=current_user.get("skills", [])
    )
    return {"interview_id": interview["id"]}


@router.get("/history")
async def get_interview_history(current_user=Depends(get_current_user)):
    db = get_db()
    cursor = db.interviews.find(
        {"user_id": str(current_user["_id"])}
    ).sort("started_at", -1).limit(20)

    interviews = []
    async for interview in cursor:
        interviews.append({
            "id": str(interview["_id"]),
            "topic": interview["topic"],
            "difficulty": interview["difficulty"],
            "status": interview["status"],
            "total_score": interview.get("total_score"),
            "started_at": interview["started_at"],
            "completed_at": interview.get("completed_at"),
            "question_count": len(interview.get("questions", []))
        })
    return interviews


@router.get("/{interview_id}")
async def get_interview_by_id(
    interview_id: str,
    current_user=Depends(get_current_user)
):
    interview = await get_interview(interview_id, str(current_user["_id"]))
    return interview


@router.put("/{interview_id}/answer")
async def submit_answer(
    interview_id: str,
    data: AnswerSubmit,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    # Verify interview belongs to user
    interview = await get_interview(interview_id, str(current_user["_id"]))

    # Update the specific question's answer using MongoDB array index
    await db.interviews.update_one(
        {"_id": ObjectId(interview_id)},
        {"$set": {
            f"questions.{data.question_index}.user_answer": data.answer
        }}
    )
    return {"message": "Answer saved"}


@router.post("/{interview_id}/complete")
async def complete_interview(
    interview_id: str,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    from app.services.interview_service import evaluate_and_complete
    result = await evaluate_and_complete(
        interview_id=interview_id,
        user_id=str(current_user["_id"])
    )
    return result

@router.get("/{interview_id}/feedback")
async def get_interview_feedback(
    interview_id: str,
    current_user=Depends(get_current_user)
):
    interview = await get_interview(interview_id, str(current_user["_id"]))

    if interview["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail="Interview is not completed yet"
        )

    return interview