export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    // モデル名を 'gemini-pro' に変更し、エンドポイントを調整
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは超自然的な力を持つ伝説の鑑定師です。
            相談者は現在「${body.type}」について悩んでいます。
            以下の悩みに対し、前世の因縁や星の導きを交えた、神秘的な鑑定結果（150文字程度）を出力してください。
            
悩み：${body.detail}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API通信エラー");
    }

    const kanteiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "啓示が得られませんでした。";

    return new Response(JSON.stringify({ result: kanteiResult }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: `【聖域の乱れ】鑑定失敗: ${e.message}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
