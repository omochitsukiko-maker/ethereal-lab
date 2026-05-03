export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ result: "Method Not Allowed" }), { status: 405 });
  }

  try {
    const { request, env } = context;
    const body = await request.json();
    const type = body.type || "総合";
    const detail = body.detail || "悩みなし";

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ result: "APIキーが設定されていません。" }), { status: 500 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `鑑定師として以下の悩みに答え、${type}に合う石を勧めてください。：${detail}` }] }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "鑑定に失敗しました。";

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: "Error: " + e.message }), { status: 500 });
  }
}
