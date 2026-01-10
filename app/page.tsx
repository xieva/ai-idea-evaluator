"use client";

import { useState } from "react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
  if (!idea) return alert("사업 아이디어를 입력하세요");

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
      // 서버가 {error, detail}로 주는 경우를 그대로 보여줌
      setError(`${data?.error ?? "에러"}${data?.detail ? `\n${data.detail}` : ""}`);
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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
      <h1 className="text-3xl font-bold">AI 사업 아이디어 평가</h1>
      <p className="text-gray-500 text-center max-w-xl">
        AI 투자자·리스크 관리자·마케터가 당신의 사업 아이디어를 냉정하게 평가합니다.
      </p>

      <textarea
        className="w-full max-w-xl border rounded p-3"
        rows={6}
        placeholder="당신의 사업 아이디어를 적어주세요"
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {loading ? "AI 평가 중..." : "AI 평가 받기"}
      </button>

      {result && (
        <section className="max-w-xl w-full border rounded p-4 mt-6 space-y-4">
          <div>
            <h2 className="font-bold">💼 투자자 AI</h2>
            <p>{result.investor}</p>
          </div>
          <div>
            <h2 className="font-bold">⚠️ 리스크 AI</h2>
            <p>{result.risk}</p>
          </div>
          <div>
            <h2 className="font-bold">📈 마케터 AI</h2>
            <p>{result.marketer}</p>
          </div>
        </section>
      )}
    </main>
  );
}
