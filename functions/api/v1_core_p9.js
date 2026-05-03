export async function onRequest(context) {
  const { env, request } = context;
  
  if (request.method !== "POST") {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const _b = await request.json();
    const { _n, _t, _d, _b_d, _b_t } = _b;

    const _db_s = {
      "金運": ["極位タイガーアイ（金運・断ち切る負債）", "真鍮化パイライト（財運・黄金の防壁）", "シトリン・ラフ（繁栄・成功）"],
      "恋愛運": ["最高位ローズクォーツ（愛・因縁の浄化）", "紅水晶・アベンチュリン（心の安息地）", "チェリークォーツ（良縁・魂の再会）"],
      "健康運": ["特級アメジスト（聖域・深淵の眠り）", "スモーキークォーツ（破邪・安定）", "緑瑪瑙（生命力・再生）"]
    };

    const _s_p = _db_s[_t] || ["導きの純粋水晶"];
    const _r_s = _s_p[Math.floor(Math.random() * _s_p.length)];

    // 修正ポイント：エンドポイントURLの記述ミスを解消
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${env.GEMINI_API_KEY}`;

    const _res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `古代の叡智を継承した伝説の鑑定師として、${_n}様を救う啓示を授けよ。
            データ：${_b_d}生/${_b_t}型/悩み：${_d}
            1.冒頭で宿命の歪みを指摘し危機感を煽れ。
            2.中盤で悩みの根源が因縁にあると説け。
            3.終盤で幸運への唯一の触媒が「${_r_s}」であると断言せよ。
            文体は厳格かつ慈悲深く、150-200文字で。`
          }]
        }]
      })
    });

    const _data = await _res.json();
    
    // 成功レスポンス
    return new Response(JSON.stringify({
      a: _data.candidates?.[0]?.content?.parts?.[0]?.text || "啓示が得られませんでした。",
      b: _r_s
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (e) {
    // デバッグ用にエラーを返す
    return new Response(JSON.stringify({ a: `波界の乱れ（Error）: ${e.message}` }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
