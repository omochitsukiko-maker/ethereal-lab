export async function onRequestPost(context) {
  const { request, env } = context;
  
  // APIキーが読み込めているかチェック
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ text: "APIキーが設定されていません。" }), { status: 500 });
  }

  try {
    const body = await request.json();
    const prompt = `あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「${body.type === 'money' ? '金運' : body.type === 'love' ? '恋愛運' : '浄化'}」に呼応する石が必要だと説得する鑑定文を800文字程度で生成してください。悩み：${body.detail}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Gemini側でエラー（安全フィルター等）が発生した場合の処理
    if (data.error) {
      return new Response(JSON.stringify({ text: "鑑定が宇宙の制限に触れました。" + data.error.message }), { status: 500 });
    }

    const resultText = data.candidates[0].content.parts[0].text;
    return new Response(JSON.stringify({ text: resultText }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ text: "システムエラー: " + error.message }), { status: 500 });
  }
}
