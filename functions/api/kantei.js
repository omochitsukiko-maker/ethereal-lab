export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ result: "Method Not Allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { request, env } = context;
    const body = await request.json();
    const type = body.type || "総合";
    const detail = body.detail || "悩みなし";

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ result: "エラー：Cloudflareの環境変数GEMINI_API_KEYが空です。" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 動的生成を一切やめ、APIキーを結合するだけの最短URL
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「${type}」に呼応する石が必要だと説得する、神秘的な鑑定文を生成してください。悩み内容：${detail}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // エラーを「鑑定に失敗しました」という言葉で隠さず、APIが吐いたエラーをそのまま画面に出す
      const msg = data.error ? data.error.message : JSON.stringify(data);
      return new Response(JSON.stringify({ result: "APIエラー詳細：" + msg }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "星の啓示を受け取れませんでした。";

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: "実行時エラー：" + e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
