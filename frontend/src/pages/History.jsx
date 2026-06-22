import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get("/interviews/history");
        setInterviews(response.data);
      } catch (err) {
        console.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-10 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Interview History
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {interviews.length} interviews completed
          </p>
        </div>
        <Link
          to="/start"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          New Interview
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <p className="text-gray-400 text-lg">No interviews yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Start your first interview to see it here
          </p>
          <Link
            to="/start"
            className="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Start Interview
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((interview) => {
            const score = interview.total_score;
            const scoreColor =
              score === null
                ? "text-gray-400"
                : score >= 7
                  ? "text-green-600"
                  : score >= 4
                    ? "text-yellow-600"
                    : "text-red-600";

            const date = new Date(interview.started_at).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "short", year: "numeric" },
            );

            return (
              <div
                key={interview.id}
                className="bg-white rounded-2xl border border-border p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <span className="text-primary-600 text-sm font-bold">
                      {interview.topic.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {interview.topic}
                    </p>
                    <p className="text-sm text-gray-400 capitalize">
                      {interview.difficulty} · {interview.question_count}{" "}
                      questions · {date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${scoreColor}`}>
                      {score !== null ? `${score}/10` : "—"}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {interview.status}
                    </p>
                  </div>
                  {interview.status === "completed" && (
                    <Link
                      to={`/feedback/${interview.id}`}
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
