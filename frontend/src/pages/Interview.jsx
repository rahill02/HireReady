import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

function Interview() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const response = await API.get(`/interviews/${id}`);
        setInterview(response.data);
      } catch (err) {
        setError("Failed to load interview");
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  const currentQuestion = interview?.questions[currentIndex];
  const totalQuestions = interview?.questions.length || 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const saveAnswer = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      await API.put(`/interviews/${id}/answer`, {
        question_index: currentIndex,
        answer: answer.trim(),
      });
    } catch (err) {
      setError("Failed to save answer");
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await saveAnswer();
    setAnswer("");
    setCurrentIndex(currentIndex + 1);
  };

  const handleFinish = async () => {
    setSaving(true);
    if (answer.trim()) {
      await API.put(`/interviews/${id}/answer`, {
        question_index: currentIndex,
        answer: answer.trim(),
      });
    }
    setSaving(false);
    setCompleting(true);

    try {
      await API.post(`/interviews/${id}/complete`);
      navigate(`/feedback/${id}`);
    } catch (err) {
      setError("Failed to complete interview");
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your interview...</p>
      </div>
    );
  }

  if (completing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 font-medium">
          AI is evaluating your answers...
        </p>
        <p className="text-gray-400 text-sm">This may take 15–30 seconds</p>
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

  return (
    <div className="max-w-[1000px] mx-auto px-10 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {interview.topic} Interview
            </h1>
            <p className="text-sm text-gray-400 capitalize">
              {interview.difficulty} difficulty
            </p>
          </div>
          <span className="text-sm font-medium text-gray-400">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 mb-6">
        <div className="flex items-start gap-3 mb-6">
          <span className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
            {currentIndex + 1}
          </span>
          <p className="text-gray-900 text-lg leading-relaxed">
            {currentQuestion?.question_text}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here... Be as detailed as you can."
            rows={8}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">
            {answer.length} characters
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {answer.trim()
            ? "Answer will be saved automatically"
            : "You can skip a question by clicking Next"}
        </p>

        {isLastQuestion ? (
          <button
            onClick={handleFinish}
            disabled={saving || completing}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Finish & Get Feedback →"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={saving}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Next Question →"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Interview;
