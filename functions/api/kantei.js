export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const apiKey = env.GEMINI_API_KEY;

  const prompt = `あなたは深層心理を読み解く伝説の鑑定師です。
  以下の悩みを持つ者に、前世の因縁を指摘しつつ、
  最終的に「${body.type === 'money' ? '金運' : body.type === 'love' ? '恋愛運' : '浄化'}」に呼応する石が必要だと説得する鑑定文（800文字程度）を生成してください。
  
  悩み：${body.detail}`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const data = await response.json();
  const text = data.candidates[0].content.parts[0].text;

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
