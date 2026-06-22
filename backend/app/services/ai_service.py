from groq import Groq
import json
import re
from app.config import settings

client = Groq(api_key=settings.groq_api_key)

async def generate_interview_questions(
    topic: str,
    difficulty: str,
    num_questions: int,
    target_role: str,
    skills: list[str]
) -> list[dict]:

    skills_text = ", ".join(skills) if skills else "general programming"

    prompt = f"""You are a senior technical interviewer at a top tech company.

Generate exactly {num_questions} interview questions for a candidate with the following profile:
- Target Role: {target_role}
- Topic: {topic}
- Difficulty: {difficulty}
- Known Skills: {skills_text}

Rules:
- Questions must match the difficulty level ({difficulty})
- Questions must be specific to {topic}
- Mix conceptual and practical questions
- Do NOT include answers

Return ONLY a valid JSON array in this exact format, no extra text:
[
  {{"question_text": "Your question here"}}
]"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    questions = json.loads(raw)
    return questions


async def evaluate_answer(
    question: str,
    user_answer: str,
    topic: str,
    difficulty: str
) -> dict:

    prompt = f"""You are a senior technical interviewer evaluating a candidate's answer.

Question: {question}
Topic: {topic}
Difficulty: {difficulty}
Candidate's Answer: {user_answer}

Evaluate the answer and return ONLY a valid JSON object in this exact format, no extra text:
{{
  "score": <number from 0 to 10>,
  "feedback": "<2-3 sentences of specific, constructive feedback>",
  "correct_points": "<what the candidate got right>",
  "improvement": "<what they should study or improve>"
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    result = json.loads(raw)
    return result


async def analyze_resume(resume_text: str) -> dict:
    # Truncate to avoid token limits
    truncated = resume_text[:4000]

    prompt = f"""You are an expert technical recruiter and career coach.

Analyze this resume and provide structured feedback:

{truncated}

Return ONLY a valid JSON object in this exact format, no extra text:
{{
  "overall_score": <number from 0 to 10>,
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
  "missing_skills": ["<skill 1>", "<skill 2>"],
  "good_for_roles": ["<role 1>", "<role 2>", "<role 3>"]
}}"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"^```json\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    return json.loads(raw)