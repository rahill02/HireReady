import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import API from "../api/axios";

const ROLE_LABELS = {
  fullstack: "Full Stack Developer",
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  dsa: "DSA / Competitive Programming",
  devops: "DevOps Engineer",
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    avgScore: null,
    lastTopic: null,
  });
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get("/interviews/history");
        const interviews = response.data;
        const completed = interviews.filter(
          (i) => i.status === "completed" && i.total_score !== null,
        );
        const avgScore =
          completed.length > 0
            ? (
                completed.reduce((sum, i) => sum + (i.total_score || 0), 0) /
                completed.length
              ).toFixed(1)
            : null;
        setStats({
          total: interviews.length,
          avgScore,
          lastTopic: interviews[0]?.topic || null,
        });

        const chartData = completed
          .slice(0, 7)
          .reverse()
          .map((i, idx) => ({
            label: `#${idx + 1}`,
            score: i.total_score || 0,
          }));
        setScoreHistory(chartData);
      } catch (err) {
        console.error("Failed to load stats");
      }
    };
    fetchStats();
  }, []);

  const maxScore = 10;

  return (
    <div className="max-w-[1400px] mx-auto px-10 py-9">
      {/* Header with accent bar */}
      <div className="flex items-center gap-3.5 mb-7">
        <div className="w-1 h-10 bg-gradient-to-b from-primary-300 to-primary-600 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Ready to practice? Let's sharpen your skills.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-border border-t-[3px] border-t-primary-600 p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-sm">
              🎯
            </div>
            <p className="text-[11px] font-medium text-gray-400 tracking-wide">
              TARGET ROLE
            </p>
          </div>
          <p className="text-base font-bold text-gray-900">
            {ROLE_LABELS[user?.target_role] || user?.target_role}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border border-t-[3px] border-t-primary-400 p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-sm">
              📝
            </div>
            <p className="text-[11px] font-medium text-gray-400 tracking-wide">
              INTERVIEWS DONE
            </p>
          </div>
          <p className="text-xl font-bold text-primary-600">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border border-t-[3px] border-t-primary-400 p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-sm">
              📊
            </div>
            <p className="text-[11px] font-medium text-gray-400 tracking-wide">
              AVERAGE SCORE
            </p>
          </div>
          <p className="text-xl font-bold text-primary-600">
            {stats.avgScore ? stats.avgScore : "—"}
            <span className="text-sm text-gray-300">/10</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border border-t-[3px] border-t-primary-600 p-5">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center text-sm">
              🧩
            </div>
            <p className="text-[11px] font-medium text-gray-400 tracking-wide">
              SKILLS LISTED
            </p>
          </div>
          <p className="text-xl font-bold text-gray-900">
            {user?.skills?.length || 0}
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-500 rounded-2xl p-7">
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <h2 className="relative text-lg font-bold text-white mb-1.5">
            Start an Interview
          </h2>
          <p className="relative text-primary-100 text-sm mb-5 max-w-md">
            Practice with AI-generated questions tailored to your role and
            skills.
          </p>
          <Link
            to="/start"
            className="relative inline-block bg-white text-primary-600 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary-50 transition-colors"
          >
            Start Interview →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-border p-7">
          <h2 className="text-lg font-bold text-gray-900 mb-1.5">
            Recent Activity
          </h2>
          <p className="text-gray-400 text-sm mb-5">
            {stats.lastTopic ? (
              <>
                Last practiced:{" "}
                <span className="font-semibold text-gray-600">
                  {stats.lastTopic}
                </span>
              </>
            ) : (
              "No interviews yet — start your first one!"
            )}
          </p>
          <Link
            to="/history"
            className="inline-block bg-gray-100 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200"
          >
            View History →
          </Link>
        </div>
      </div>

      {/* Score trend chart */}
      <div className="bg-white rounded-2xl border border-border p-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Score Trend</h2>
          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md">
            Last {scoreHistory.length || 0} interviews
          </span>
        </div>

        {scoreHistory.length === 0 ? (
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-gray-300">
              Complete an interview to see your trend here
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-3.5 h-32 px-2">
            {scoreHistory.map((item, idx) => {
              const heightPercent = Math.max((item.score / maxScore) * 100, 4);
              const isHighest =
                item.score === Math.max(...scoreHistory.map((s) => s.score));
              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full flex items-end justify-center"
                    style={{ height: "100px" }}
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isHighest ? "bg-primary-600" : "bg-primary-300"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-300">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
