export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  
  // Cloudflareの環境変数からAPIキーを安全に読み込みます
  const apiKey = env.GEMINI_API_KEY;

  const prompt = `あなたは深層意識を読み解く伝説の鑑定師です。
  以下の悩みを持つ者に、前世の因縁や魂の歪みを指摘しつつ、
  最終的に「${body.type === 'money' ? '金運' : body.type === 'love' ? '恋愛運' : '浄化'}」に呼応する守護石を手に入れることが唯一の救済であると、
  800文字程度の重厚な鑑定文で説得してください。
  
  悩み：${body.detail}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;

    return new Response(JSON.stringify({ text: resultText }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ text: "宇宙の波長が乱れています。再度お試しください。" }), { status: 500 });
  }
}
