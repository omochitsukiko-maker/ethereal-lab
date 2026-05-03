export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    // v1 エンドポイントを使用し、モデル名をフルパスで指定
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは伝説的な霊能鑑定師です。
相談者は「${body.type}」についての導きを求めています。
以下の悩みに対し、宇宙の真理や前世の因縁に触れながら、最後には希望が見えるような神秘的な鑑定結果（150文字程度）を作成してください。

悩み：${body.detail}`
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // APIからの詳細なエラーメッセージをフロントに返す
      throw new Error(data.error?.message || "API接続に失敗しました");
    }

    const kanteiResult = data.candidates?.[0]?.content?.parts?.[0]?.text || "啓示は霧の中に隠されました。もう一度お試しください。";

    return new Response(JSON.stringify({ result: kanteiResult }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: `【聖域の乱れ】鑑定を完了できませんでした。原因: ${e.message}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
