"use client";

import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!idea || idea.trim().length < 5) {
      alert("사업 아이디어를 조금 더 자세히 적어주세요.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          `${data?.error ?? "에러가 발생했습니다."}${
            data?.detail ? `\n${data.detail}` : ""
          }`
        );
        setLoading(false);
        return;
      }

      setResult(data);
    } catch (e: any) {
      setError(`네트워크/브라우저 오류: ${String(e?.message ?? e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-6">
      <h1 className="text-3xl font-bold">AI 사업 아이디어 평가</h1>
      <p className="text-gray-600 text-center max-w-xl">
        AI 투자자 · 리스크 관리자 · 마케터가 당신의 사업 아이디어를
        냉정하게 평가합니다.
      </p>

      <textarea
        className="w-full max-w-xl border rounded p-3"
        rows={8}
        placeholder="당신의 사업 아이디어를 적어주세요"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "AI 평가 중..." : "AI 평가 받기"}
      </button>

      {/* 에러 표시 */}
      {error && (
        <pre className="max-w-xl w-full border rounded p-3 bg-red-50 text-red-700 whitespace-pre-wrap">
          {error}
        </pre>
      )}

      {/* 결과 표시 */}
      {result && (
        <section className="max-w-xl w-full border rounded p-4 mt-4 space-y-4">
          <div>
            <h2 className="font-bold text-lg">💼 투자자 AI</h2>
            <p className="whitespace-pre-wrap">{result.investor}</p>
          </div>

          <div>
            <h2 className="font-bold text-lg">⚠️ 리스크 AI</h2>
            <p className="whitespace-pre-wrap">{result.risk}</p>
          </div>

          <div>
            <h2 className="font-bold text-lg">📈 마케터 AI</h2>
            <p className="whitespace-pre-wrap">{result.marketer}</p>
          </div>
        </section>
      )}
    </main>
  );
}
