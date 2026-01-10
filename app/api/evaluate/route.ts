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
    const body = (await req.json()) as { idea?: string };
    const idea = (body.idea ?? "").trim();

    if (idea.length < 5) {
      return json(
        { error: "아이디어가 너무 짧아요. 조금 더 자세히 적어주세요." },
        400
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json(
        {
          error:
            "OPENAI_API_KEY가 설정되어 있지 않습니다. (Vercel > Settings > Environment Variables 확인)",
        },
        500
      );
    }

    const system = `
너는 'AI 사업 아이디어 평가 도시'의 심사관들이다.
반드시 JSON만 출력한다. 그 외의 문장은 절대 출력하지 않는다.
형식: {"investor":"...","risk":"...","marketer":"..."}
각 값은 한국어로 5~8문장. 과장 없이 현실적으로 말한다.
`.trim();

    const user = `
사업 아이디어:
${idea}

요구사항:
- investor: 투자 관점(시장, 수익모델, 확장성, 숫자) 위주로 냉정하게.
- risk: 망할 가능성, 법/운영/수요 리스크를 공격적으로.
- marketer: 타겟/포지셔닝/획득채널/메시지를 현실적으로 제시.
`.trim();

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
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("OPENAI_HTTP_ERROR:", resp.status, text);
      return json(
        {
          error: "OpenAI 호출 실패",
          detail: `status=${resp.status}\n${text}`,
        },
        500
      );
    }

    const data = await resp.json();
    const content: string | undefined = data?.choices?.[0]?.message?.content;

    if (!content) {
      console.error("OPENAI_EMPTY_CONTENT:", data);
      return json({ error: "AI 응답이 비어있습니다." }, 500);
    }

    let parsed: EvalResponse;
    try {
      parsed = JSON.parse(content) as EvalResponse;
    } catch {
      console.error("OPENAI_BAD_JSON:", content);
      return json(
        {
          error: "AI가 JSON 형식을 지키지 않았습니다.",
          raw: content,
        },
        500
      );
    }

    if (!parsed.investor || !parsed.risk || !parsed.marketer) {
      console.error("OPENAI_MISSING_FIELDS:", parsed);
      return json(
        {
          error: "AI 응답 형식이 올바르지 않습니다.",
          raw: parsed,
        },
        500
      );
    }

    return json(parsed, 200);
  } catch (e: any) {
    console.error("EVALUATE_ERROR:", e);
    return json(
      { error: "서버 처리 중 오류", detail: String(e?.message ?? e) },
      500
    );
  }
}
