export async function onRequestPost(context) {
  return new Response(JSON.stringify({ text: "通信成功！プログラムは動いています。" }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
