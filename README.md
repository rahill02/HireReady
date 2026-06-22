# HireReady

An AI-powered mock interview preparation platform that helps developers practice technical interviews, get instant AI feedback, and track their progress over time.

🔗 **Live Demo:** _add your deployed link here once Phase 11 is complete_

---

## Features

- **AI-Generated Interview Questions** — tailored to your target role, topic, and skill set using Groq's Llama 3.3 70B model
- **Mock Interview Sessions** — answer questions one at a time in a clean, focused interface
- **AI Feedback Engine** — get a score (0–10) and detailed feedback on every answer, including what you did well and what to improve
- **Analytics Dashboard** — visualize your score trends and performance by topic over time
- **Resume Analysis** — upload a PDF resume and get AI-powered feedback on strengths, weaknesses, and suitable roles
- **Profile & Skills Management** — keep your skills and target role updated so questions stay relevant
- **Secure Authentication** — JWT-based auth with bcrypt password hashing

---

## Tech Stack

**Frontend**
- React.js (Vite)
- Tailwind CSS
- React Router
- Axios
- Recharts

**Backend**
- FastAPI (Python)
- MongoDB Atlas
- JWT Authentication + bcrypt
- Groq AI (Llama 3.3 70B)
- Cloudinary (file storage)
- PyMuPDF (PDF text extraction)

**Deployment**
- Frontend → Vercel
- Backend → Render

---

## Project Structure

```
hireready/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # MongoDB connection
│   │   ├── models/               # Pydantic schemas
│   │   ├── routes/               # API endpoints
│   │   ├── services/             # Business logic (AI, auth, interviews)
│   │   └── utils/                # JWT, password hashing, dependencies
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/                  # Axios configuration
    │   ├── components/           # Reusable UI components
    │   ├── context/              # Auth context (global state)
    │   ├── pages/                # Page-level components
    │   └── App.jsx
    └── package.json
```

---

## How It Works

1. **Register / Login** — JWT-based authentication with hashed passwords
2. **Set up your profile** — choose a target role and list your skills
3. **Start an interview** — pick a topic, difficulty, and number of questions
4. **AI generates questions** — tailored to your profile via Groq's LLM
5. **Answer each question** — responses are saved as you go
6. **Get AI feedback** — every answer is scored and evaluated on completion
7. **Track progress** — view history and analytics across all your interviews

---

## Running Locally

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create a `.env` file in `backend/` with:
```
MONGODB_URL=your_mongodb_connection_string
DATABASE_NAME=ai_interview_db
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=your_groq_api_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Author

**Rahil Qureshi**
B.Tech Computer Science & Engineering, Medicaps University, Indore