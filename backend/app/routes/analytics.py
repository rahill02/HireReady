from fastapi import APIRouter, Depends
from app.utils.dependencies import get_current_user, get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_analytics(current_user=Depends(get_current_user)):
    db = get_db()
    user_id = str(current_user["_id"])

    # Fetch all completed interviews
    cursor = db.interviews.find({
        "user_id": user_id,
        "status": "completed"
    }).sort("completed_at", 1)

    interviews = []
    async for interview in cursor:
        interviews.append(interview)

    if not interviews:
        return {
            "total_interviews": 0,
            "avg_score": 0,
            "best_score": 0,
            "score_history": [],
            "topic_performance": [],
            "weak_topics": [],
            "strong_topics": []
        }

    # Score history for line chart
    score_history = []
    for i, interview in enumerate(interviews):
        score_history.append({
            "interview_number": i + 1,
            "score": interview.get("total_score", 0),
            "topic": interview.get("topic", ""),
            "date": interview["completed_at"].strftime("%d %b") if interview.get("completed_at") else ""
        })

    # Topic performance for bar chart
    topic_map = {}
    for interview in interviews:
        topic = interview.get("topic", "Unknown")
        score = interview.get("total_score", 0)
        if topic not in topic_map:
            topic_map[topic] = {"scores": [], "topic": topic}
        topic_map[topic]["scores"].append(score)

    topic_performance = []
    for topic, data in topic_map.items():
        scores = data["scores"]
        avg = round(sum(scores) / len(scores), 1)
        topic_performance.append({
            "topic": topic,
            "avg_score": avg,
            "attempts": len(scores)
        })

    # Sort by avg score
    topic_performance.sort(key=lambda x: x["avg_score"], reverse=True)

    # Weak and strong topics
    strong_topics = [t for t in topic_performance if t["avg_score"] >= 7]
    weak_topics = [t for t in topic_performance if t["avg_score"] < 5]

    all_scores = [i.get("total_score", 0) for i in interviews]
    avg_score = round(sum(all_scores) / len(all_scores), 1)
    best_score = max(all_scores)

    return {
        "total_interviews": len(interviews),
        "avg_score": avg_score,
        "best_score": best_score,
        "score_history": score_history,
        "topic_performance": topic_performance,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics
    }