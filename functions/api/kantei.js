export async function onRequest(context) {
  try {
    // 実行されたこと自体をレスポンスで返す
    return new Response(JSON.stringify({ 
      status: "Functions is executing",
      method: context.request.method,
      hasEnv: !!context.env,
      envKeys: context.env ? Object.keys(context.env) : []
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    // もしここでエラーが出るなら、その内容をレスポンスとして返す
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
