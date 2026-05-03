export async function onRequest(context) {
  const { env, request } = context;
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  try {
    const body = await request.json();
    const { name, type, detail, birth, blood } = body;

    const stonePool = {
      "金運": ["極位タイガーアイ（金運・断ち切る負債）", "真鍮化パイライト（財運・黄金の防壁）", "シトリン・ラフ（繁栄・成功）"],
      "恋愛運": ["最高位ローズクォーツ（愛・因縁の浄化）", "紅水晶・アベンチュリン（心の安息地）", "チェリークォーツ（良縁・魂の再会）"],
      "健康運": ["特級アメジスト（聖域・深淵の眠り）", "スモーキークォーツ（破邪・安定）", "緑瑪瑙（生命力・再生）"]
    };

    const selectedPool = stonePool[type] || ["導きの純粋水晶"];
    const randomStone = selectedPool[Math.floor(Math.random() * selectedPool.length)];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${env.GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは古の叡智を継承した「孤高の伝説の鑑定師」です。以下のデータに基づき、${name}という「個」の魂を救う啓示を授けよ。

【相談者情報】
・呼称：${name}様
・生年月日：${birth || "不明"}
・血液型：${blood}型
・悩み：${detail}

【鑑定の掟】
1. 冒頭で「${name}様、あなたの宿命は今、極めて不安定な均衡の上にあります」と告げ、危機感を煽ること。
2. 血液型と生年月日が示す気質が、現在の負の連鎖を引き寄せている原因（宿命の綻び）であることを${name}様に説け。
3. 語り口は冷徹かつ厳格だが、救済を求める者への慈悲を感じさせる文体（150〜200文字）に。
4. この暗雲を払い、光を呼び戻す唯一の触媒は「${randomStone}」であると${name}様に強く断言し、魂の浄化を促せ。`
          }]
        }]
      })
    });

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(JSON.stringify({ res: resultText, stn: randomStone }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    return new Response(JSON.stringify({ res: "因果律の乱れにより、現時点での啓示は不可能です。" }), { status: 200 });
  }
}
