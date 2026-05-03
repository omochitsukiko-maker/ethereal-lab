export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    
    // 修正：エンドポイントを v1beta に、モデル名をフルパスに変更
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは伝説の鑑定師です。相談内容は「${body.type}」についてです。以下の悩みに対し、神秘的で心に響く鑑定結果（150文字程度）を出力してください。悩み：${body.detail}`
          }]
        }]
      })
    });

    const data = await response.json();

    // エラーハンドリング
    if (!response.ok) {
      const errorMsg = data.error?.message || "API接続エラー";
      throw new Error(errorMsg);
    }

    const kanteiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "啓示が得られませんでした。";

    return new Response(JSON.stringify({ result: kanteiResult }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    // フロントエンドにエラー原因を通知
    return new Response(JSON.stringify({ result: `【聖域の乱れ】鑑定失敗: ${e.message}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
