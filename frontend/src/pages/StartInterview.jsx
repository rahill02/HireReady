import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const TOPICS = [
  { value: "React", label: "React.js" },
  { value: "Python", label: "Python" },
  { value: "JavaScript", label: "JavaScript" },
  { value: "Data Structures", label: "Data Structures" },
  { value: "Algorithms", label: "Algorithms" },
  { value: "System Design", label: "System Design" },
  { value: "SQL", label: "SQL & Databases" },
  { value: "Node.js", label: "Node.js" },
  { value: "Machine Learning", label: "Machine Learning" },
  { value: "FastAPI", label: "FastAPI" },
];

const DIFFICULTIES = [
  {
    value: "easy",
    label: "Easy",
    description: "Fundamentals and basic concepts",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Practical application and problem solving",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Advanced concepts and system design",
  },
];

function StartInterview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topic, setTopic] = useState("React");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await API.post("/interviews/create", {
        topic,
        difficulty,
        num_questions: numQuestions,
      });
      navigate(`/interview/${response.data.interview_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create interview");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto px-10 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Start a Mock Interview
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          AI will generate questions based on your profile and selected topic
        </p>
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-6">
        <p className="text-sm text-primary-700">
          Questions will be tailored for a{" "}
          <span className="font-semibold">{user?.target_role}</span> role
          {user?.skills?.length > 0 && (
            <>
              {" "}
              using your skills:{" "}
              <span className="font-semibold">{user.skills.join(", ")}</span>
            </>
          )}
        </p>
        {(!user?.skills || user.skills.length === 0) && (
          <p className="text-xs text-primary-500 mt-1">
            Tip: Add skills to your profile for more relevant questions
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TOPICS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTopic(t.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                  topic === t.value
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  difficulty === d.value
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                }`}
              >
                <p className="font-medium text-sm">{d.label}</p>
                <p
                  className={`text-xs mt-0.5 ${
                    difficulty === d.value
                      ? "text-primary-100"
                      : "text-gray-400"
                  }`}
                >
                  {d.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions:{" "}
            <span className="text-primary-600 font-bold">{numQuestions}</span>
          </label>
          <input
            type="range"
            min="3"
            max="10"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full accent-primary-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>3 (quick)</span>
            <span>10 (thorough)</span>
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Generating questions with AI..." : "Start Interview →"}
        </button>

        {loading && (
          <p className="text-center text-sm text-gray-400">
            This may take 5–10 seconds while AI generates your questions
          </p>
        )}
      </div>
    </div>
  );
}

export default StartInterview;
