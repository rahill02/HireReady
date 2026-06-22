import { useState, useEffect } from "react";
import API from "../api/axios";

function ScoreBadge({ score }) {
  const color =
    score >= 7
      ? "bg-green-100 text-green-700"
      : score >= 4
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";
  return (
    <span className={`text-lg font-bold px-3 py-1 rounded-full ${color}`}>
      {score}/10
    </span>
  );
}

function TagList({ items, color }) {
  if (!items || items.length === 0) return null;
  const styles = {
    green: "bg-green-50 text-green-700 border border-green-100",
    red: "bg-red-50 text-red-700 border border-red-100",
    blue: "bg-primary-50 text-primary-700 border border-primary-100",
    yellow: "bg-yellow-50 text-yellow-700 border border-yellow-100",
  };
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, i) => (
        <span
          key={i}
          className={`text-sm px-3 py-1 rounded-full ${styles[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Resume() {
  const [analysis, setAnalysis] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await API.get("/resume/analysis");
        setAnalysis(response.data.analysis);
        setResumeUrl(response.data.resume_url);
      } catch (err) {
        // 404 means no resume yet
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are accepted");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Max 5MB");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysis(response.data.analysis);
      setResumeUrl(response.data.resume_url);
      setSuccess("Resume uploaded and analyzed successfully!");
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    handleUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files[0]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto px-10 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Resume Analysis
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Upload your resume for AI-powered feedback
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-2xl p-10 text-center mb-8 transition-colors ${
          dragOver
            ? "border-primary-400 bg-primary-50"
            : "border-gray-200 hover:border-primary-300"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500">
              Uploading and analyzing your resume...
            </p>
            <p className="text-gray-400 text-sm">This may take 10–20 seconds</p>
          </div>
        ) : (
          <>
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-700 font-medium">
              Drag and drop your resume here
            </p>
            <p className="text-gray-400 text-sm mt-1 mb-4">
              PDF only · Max 5MB
            </p>
            <label className="cursor-pointer bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Browse File
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            {resumeUrl && (
              <p className="text-xs text-gray-400 mt-3">
                You already have a resume uploaded.{" "}
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 underline"
                >
                  View it
                </a>{" "}
                · Upload a new one to replace it
              </p>
            )}
          </>
        )}
      </div>

      {analysis && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Overall Score
              </h2>
              <ScoreBadge score={analysis.overall_score} />
            </div>
            <p className="text-gray-600 text-sm">{analysis.summary}</p>
          </div>

          {analysis.good_for_roles?.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Suitable Roles
              </h2>
              <TagList items={analysis.good_for_roles} color="blue" />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                ✓ Strengths
              </h2>
              <ul className="space-y-2">
                {analysis.strengths?.map((s, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-green-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                ✗ Weaknesses
              </h2>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((w, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-red-400 mt-0.5">•</span>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              ↑ Suggestions to Improve
            </h2>
            <ul className="space-y-2">
              {analysis.suggestions?.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-700"
                >
                  <span className="text-primary-500 font-bold mt-0.5">
                    {i + 1}.
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {analysis.missing_skills?.length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-base font-semibold text-gray-900 mb-2">
                Skills to Add
              </h2>
              <TagList items={analysis.missing_skills} color="yellow" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Resume;
