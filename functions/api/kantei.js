export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    
    // 特定した有効なリソース名「gemini-3-flash-preview」を使用
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたはYouTubeチャンネル「EOB 地球観測局」のマスターOSのような、冷徹さと神秘性を兼ね備えた伝説の鑑定師です。
            相談者は「${body.type}」の導きを求めています。
            以下の悩みに対し、前世の因縁を読み解くような、鋭く説得力のある鑑定結果（150文字程度）を出力してください。
            
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
