export async function onRequest(context) {
  return new Response(JSON.stringify({ 
    message: "Functions is working!",
    timestamp: new Date().toISOString() 
  }), {
    headers: { "Content-Type": "application/json" }
  });
}
