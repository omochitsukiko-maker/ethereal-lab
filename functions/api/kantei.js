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
      return new Response(JSON.stringify({ result: "エラー：GEMINI_API_KEYが未設定です。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // エラーメッセージに基づき、最も標準的なエンドポイント形式に固定
    // models/ プレフィックスを含めた完全なモデル名を使用します
    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY;

    const response = await fetch(API_URL, {
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
      // 万が一エラーが発生した際も、具体的なメッセージをフロントに渡して「鑑定に失敗しました」で終わらせない
      const errorMsg = data.error?.message || JSON.stringify(data);
      return new Response(JSON.stringify({ result: "交信失敗：" + errorMsg }), {
        status: 200, // フロントエンドの catch を避けるため 200 で返却
        headers: { "Content-Type": "application/json" }
      });
    }

    // 応答テキストの抽出
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "星の配置を読み取ることができませんでした。";

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
