export async function onRequest(context) {
  const { env, request } = context;
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await request.json();
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `あなたは伝説の鑑定師です。以下の悩みに対し、前世の因縁を含めた神秘的な鑑定結果（150文字程度）を出力してください。悩み：${body.detail}` }] }]
      })
    });

    const data = await response.json();
    
    // APIがエラーならその詳細を、成功なら鑑定文を。
    // 「鑑定に失敗しました」という固定文字はここには存在しません。
    const finalResult = response.ok 
      ? (data.candidates?.[0]?.content?.parts?.[0]?.text || "啓示が得られませんでした。")
      : "APIエラー詳細: " + (data.error?.message || JSON.stringify(data));

    return new Response(JSON.stringify({ result: finalResult }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: "システムエラー: " + e.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
