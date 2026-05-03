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

    // エラーメッセージに基づき、URLを直接文字列で結合する最もシンプルな形式に変更
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「${type}」に呼応する石が必要だと説得する、神秘的な鑑定文を生成してください。：${detail}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // APIから返ってきた生のメッセージをそのまま表示させる（原因特定のため）
      const apiError = data.error?.message || JSON.stringify(data);
      return new Response(JSON.stringify({ result: "API交信エラー: " + apiError }), {
        status: 200, // フロント側で受け取れるよう200で返します
        headers: { "Content-Type": "application/json" }
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "鑑定結果の解析に失敗しました。";

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: "システムエラー：" + e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
