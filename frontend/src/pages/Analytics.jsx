import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await API.get("/analytics/dashboard");
        setData(response.data);
      } catch (err) {
        console.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (!data || data.total_interviews === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-10 py-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Analytics</h1>
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <p className="text-gray-400 text-lg">No data yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Complete at least one interview to see your analytics
          </p>
          <Link
            to="/start"
            className="inline-block mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Start Interview
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-10 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Track your progress over time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Interviews"
          value={data.total_interviews}
          sub="completed sessions"
        />
        <StatCard
          label="Average Score"
          value={`${data.avg_score}/10`}
          sub="across all interviews"
        />
        <StatCard
          label="Best Score"
          value={`${data.best_score}/10`}
          sub="your highest score"
        />
      </div>

      {data.score_history.length > 1 && (
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Score Trend
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            Your scores across interviews
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.score_history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2eded",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${value}/10`, "Score"]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#0e7490"
                strokeWidth={2.5}
                dot={{ fill: "#0e7490", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.topic_performance.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Performance by Topic
          </h2>
          <p className="text-sm text-gray-400 mb-6">Average score per topic</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.topic_performance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="topic"
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 10]}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2eded",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${value}/10`, "Avg Score"]}
              />
              <Bar dataKey="avg_score" fill="#0e7490" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            ✓ Strong Topics
          </h2>
          {data.strong_topics.length === 0 ? (
            <p className="text-sm text-gray-400">
              Score 7+ on a topic to see it here
            </p>
          ) : (
            <div className="space-y-2">
              {data.strong_topics.map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {topic.topic}
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    {topic.avg_score}/10
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            ↑ Topics to Improve
          </h2>
          {data.weak_topics.length === 0 ? (
            <p className="text-sm text-gray-400">
              No weak topics — keep it up!
            </p>
          ) : (
            <div className="space-y-2">
              {data.weak_topics.map((topic) => (
                <div
                  key={topic.topic}
                  className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {topic.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-red-500">
                      {topic.avg_score}/10
                    </span>
                    <Link
                      to="/start"
                      className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full hover:bg-red-200"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
