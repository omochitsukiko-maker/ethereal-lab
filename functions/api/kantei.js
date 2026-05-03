export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ result: "Method Not Allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const { request, env } = context;
    const body = await request.json();
    const type = body.type || "総合";
    const detail = body.detail || "悩みなし";

    if (!env.GEMINI_API_KEY) {
      return new Response(JSON.stringify({ result: "エラー：管理画面でGEMINI_API_KEYを設定してください。" }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // モデル名をパスに含めた完全なURL。一切の動的生成を排除。
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + env.GEMINI_API_KEY;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "あなたは伝説の鑑定師です。以下の悩みを持つ者に、前世の因縁を指摘しつつ、最終的に「" + type + "」に呼応する石が必要だと説得する、神秘的な鑑定文を150文字程度で生成してください。悩み：" + detail
          }]
        }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // エラーが発生した場合、そのメッセージを鑑定結果の欄に表示させる
      const errorDetail = data.error ? data.error.message : JSON.stringify(data);
      return new Response(JSON.stringify({ result: "APIエラー発生：" + errorDetail }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "運命の糸が絡まり、読み取れませんでした。";

    return new Response(JSON.stringify({ result: resultText }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ result: "システムエラー：" + e.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
}
