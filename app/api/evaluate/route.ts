export const runtime = "nodejs";

type EvalResponse = {
  investor: string;
  risk: string;
  marketer: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const { idea } = (await req.json()) as { idea?: string };

    if (!idea || idea.trim().length < 5) {
      return json({ error: "아이디어가 너무 짧아요. 조금 더 자세히 적어주세요." }, 400);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json(
        { error: "서버에 OPENAI_API_KEY가 설정되어 있지 않습니다. (Vercel Environment Variables 확인)" },
        500
      );
    }

    // 캐릭터 3명: 투자자 / 리스크 / 마케터
    const system = `
너는 'AI 사업 아이디어 평가 도시'의 심사관들이다.
출력은 반드시 JSON만. 다른 말 금지.
JSON 형태: {"investor":"...","risk":"...","marketer":"..."}
각 값은 한국어로 5~8문장. 과장 없이 현실적으로.`;

    const user = `
사업 아이디어:
${idea}

요구사항:
- investor: 투자 관점(시장, 수익모델, 확장성, 숫자) 위주로 냉정하게.
- risk: 망할 가능성, 법/운영/수요 리스크를 공격적으로.
- marketer: 타겟/포지셔닝/획득채널/메시지를 현실적으로 제시.
`;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system.trim() },
          { role: "user", content: user.trim() },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return json({ error: "OpenAI 호출 실패", detail: text }, 500);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      return json({ error: "AI 응답이 비어있습니다." }, 500);
    }

    const parsed = JSON.parse(content) as EvalResponse;

    // 최소 안전장치
    if (!parsed.investor || !parsed.risk || !parsed.marketer) {
      return json({ error: "AI 응답 형식이 올바르지 않습니다.", raw: content }, 500);
    }

    return json(parsed, 200);
  } catch (e: any) {
  console.error("EVALUATE_ERROR:", e);
  return json({ error: "서버 처리 중 오류", detail: String(e?.message ?? e) }, 500);
}
