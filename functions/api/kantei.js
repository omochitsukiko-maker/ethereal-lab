export async function onRequest(context) {
  // POSTメソッド以外は受け付けない
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { request, env } = context;
    const body = await request.json();
    
    // 入力値の取得
    const type = body.type || "総合";
    const detail = body.detail || "悩みなし";

    // 環境変数の確認
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "APIキーが設定されていません。" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // プロンプトの組み立て
    const prompt = `あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「${type}」に呼応する石（パワーストーン）が必要だと説得する、神秘的な鑑定文を生成してください。
悩み：${detail}`;

    // Gemini APIへのリクエスト
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Gemini API Error", details: data }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 鑑定結果の抽出
    const resultText = data.candidates[0].content.parts[0].text;

    // フロントエンドの data.result という指定に合わせて返却
    return new Response(JSON.stringify({ 
      result: resultText 
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: "予期せぬエラー: " + e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
