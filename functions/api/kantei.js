export async function onRequest(context) {
  const { env, request } = context;
  
  // POSTメソッド以外は拒否
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは超自然的な力を持つ伝説の鑑定師です。以下の悩みに対し、前世の因縁や星の導きを交えた、神秘的で説得力のある鑑定結果（150文字程度）を出力してください。
            
悩み：${body.detail}`
          }]
        }]
      })
    });

    const data = await response.json();

    // APIエラーのハンドリング
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API Error");
    }

    // 生成されたテキストの抽出
    const kanteiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "現在は星の導きが得られないようです。時間を置いて再度お試しください。";

    return new Response(JSON.stringify({ result: kanteiResult }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    // ユーザーにエラーの詳細を返し、原因を特定しやすくする
    return new Response(JSON.stringify({ result: `【聖域の乱れ】鑑定を完了できませんでした。原因: ${e.message}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
