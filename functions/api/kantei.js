export async function onRequest(context) {
  const { env } = context;
  try {
    // 利用可能なモデルの一覧を取得する専用エンドポイント
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${env.GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    // 取得したモデル名のリストを画面に返す
    const modelNames = data.models.map(m => m.name).join(", ");
    return new Response(JSON.stringify({ result: `利用可能なリソース名: ${modelNames}` }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ result: `モデル取得失敗: ${e.message}` }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
