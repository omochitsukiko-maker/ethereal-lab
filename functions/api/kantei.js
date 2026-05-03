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
      return new Response(JSON.stringify({ result: "エラー：APIキーが設定されていません。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「${type}」に呼応する石が必要だと説得する、神秘的な鑑定文を生成してください。：${detail}` }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || "Gemini APIエラー";
      return new Response(JSON.stringify({ result: `交信失敗：${errorMsg}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 複数のレスポンス形式に対応する安全な抽出
    let resultText = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      resultText = data.candidates[0].content.parts[0].text;
    } else if (data.result) {
      resultText = data.result;
    } else {
      resultText = "星の配置が読み取れませんでした。内容を変えて再度お試しください。";
    }

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: "エラー発生：" + e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
