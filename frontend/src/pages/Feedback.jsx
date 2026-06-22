import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";

function ScoreCircle({ score }) {
  const color =
    score >= 7
      ? "text-green-600"
      : score >= 4
        ? "text-yellow-500"
        : "text-red-500";

  const bgColor =
    score >= 7
      ? "bg-green-50 border-green-200"
      : score >= 4
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div
      className={`w-32 h-32 rounded-full border-4 ${bgColor} flex flex-col items-center justify-center`}
    >
      <span className={`text-3xl font-bold ${color}`}>{score}</span>
      <span className="text-xs text-gray-500">out of 10</span>
    </div>
  );
}

function QuestionCard({ question, index }) {
  const [expanded, setExpanded] = useState(index === 0);

  const score = question.score ?? 0;
  const scoreColor =
    score >= 7
      ? "text-green-600 bg-green-50"
      : score >= 4
        ? "text-yellow-600 bg-yellow-50"
        : "text-red-600 bg-red-50";

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="flex-shrink-0 w-7 h-7 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-gray-800 line-clamp-1">
            {question.question_text}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span
            className={`text-sm font-bold px-2 py-0.5 rounded-full ${scoreColor}`}
          >
            {score}/10
          </span>
          <span className="text-gray-400 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
          <div className="mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Your Answer
            </p>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {question.user_answer || (
                  <span className="text-gray-400 italic">
                    No answer provided
                  </span>
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              AI Feedback
            </p>
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
              <p className="text-sm text-gray-700">
                {question.ai_feedback || "No feedback available"}
              </p>
            </div>
          </div>

          {question.correct_points && (
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-2">
                ✓ What you got right
              </p>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  {question.correct_points}
                </p>
              </div>
            </div>
          )}

          {question.improvement && (
            <div>
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-2">
                ↑ What to improve
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-gray-700">{question.improvement}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Feedback() {
  const { id } = useParams();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await API.get(`/interviews/${id}/feedback`);
        setInterview(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your feedback...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const score = interview.total_score ?? 0;
  const scoreLabel =
    score >= 8
      ? "Excellent!"
      : score >= 6
        ? "Good job!"
        : score >= 4
          ? "Keep practicing"
          : "Needs improvement";

  const scoreSublabel =
    score >= 8
      ? "You have a strong grasp of this topic."
      : score >= 6
        ? "You understand the basics well. Review the weak areas."
        : score >= 4
          ? "You have some understanding but need more practice."
          : "Focus on the fundamentals of this topic before your next attempt.";

  return (
    <div className="max-w-[1100px] mx-auto px-10 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Interview Feedback
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {interview.topic} · {interview.difficulty} difficulty ·{" "}
          {interview.questions.length} questions
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 mb-8 flex items-center gap-8">
        <ScoreCircle score={score} />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{scoreLabel}</h2>
          <p className="text-gray-500 mt-1 text-sm">{scoreSublabel}</p>
          <div className="flex gap-3 mt-4">
            <Link
              to="/start"
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Try Another Interview
            </Link>
            <Link
              to="/history"
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              View History
            </Link>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Question Breakdown
        </h2>
        <div className="space-y-3">
          {interview.questions.map((question, index) => (
            <QuestionCard key={index} question={question} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Feedback;
