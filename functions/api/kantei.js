export async function onRequest(context) {
  return new Response(JSON.stringify({ text: "システムは正常です" }), {
    headers: { "content-type": "application/json" }
  });
}
