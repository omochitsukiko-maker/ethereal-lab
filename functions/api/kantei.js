export async function onRequest(context) {
  // POSTメソッド以外を弾く
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { request, env } = context;

  try {
    // 1. 環境変数のチェック
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("API_KEY_MISSING");
      return new Response(JSON.stringify({ text: "環境変数が読み込めていません。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. リクエストボディの解析
    const body = await request.json();
    const type = body.type || "general";
    const detail = body.detail || "悩みなし";

    // 3. プロンプト作成
    const prompt = `あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「${type === 'money' ? '金運' : type === 'love' ? '恋愛運' : '浄化'}」に呼応する石が必要だと説得する鑑定文を生成してください。悩み：${detail}`;

    // 4. Gemini APIへのフェッチ
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // 5. APIレスポンスの検証
    if (!response.ok) {
      console.error("Gemini_API_Error", data);
      return new Response(JSON.stringify({ text: "宇宙の通信に失敗しました。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resultText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ text: resultText }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    // 6. 致命的なエラーのログ出力
    console.error("Critical_Error:", err.message);
    return new Response(JSON.stringify({ text: "予期せぬエラー: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
