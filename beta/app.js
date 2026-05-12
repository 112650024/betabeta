const stateProfiles = {
  green: {
    glucose: 92,
    trend: "↘ 下降中",
    summary: "目前看起來很穩定",
    greeting: "嗨，我是小貝",
    greetingSub: "今天的血糖跟著節奏走得很穩，繼續保持就好。",
    chart: [98, 110, 128, 142, 138, 124, 112, 78, 86, 120, 134, 128, 116, 108, 102, 92],
    tir: 95,
    chips: [
      { label: "穩定中", tone: "" },
      { label: "無急升", tone: "" },
      { label: "餐後可散步", tone: "" },
    ],
  },
  orange: {
    glucose: 155,
    trend: "↗ 餐後緩升",
    summary: "餐後正常範圍，預計 30 分鐘內回穩",
    greeting: "小貝陪你消化一下",
    greetingSub: "剛吃飽飯血糖會自然爬升，目前在預期區間內，散步 10 分鐘會更平穩。",
    chart: [98, 108, 122, 138, 132, 118, 108, 84, 92, 116, 128, 122, 110, 124, 148, 155],
    tir: 86,
    chips: [
      { label: "餐後正常", tone: "orange" },
      { label: "緩升中", tone: "orange" },
      { label: "建議散步", tone: "" },
    ],
  },
  red: {
    glucose: 202,
    trend: "↑ 明顯升高",
    summary: "目前已超出建議範圍",
    greeting: "小貝有點擔心你",
    greetingSub: "血糖超出建議範圍，請依照你的照護計畫處理，必要時聯絡醫師。",
    chart: [124, 142, 188, 196, 168, 138, 124, 62, 78, 132, 158, 178, 196, 218, 210, 202],
    tir: 58,
    chips: [
      { label: "超出範圍", tone: "red" },
      { label: "夜間曾偏低", tone: "orange" },
      { label: "建議補水", tone: "" },
    ],
  },
};

const stateOrder = ["green", "orange", "red"];
let activeState = "green";

const currentProfile = () => stateProfiles[activeState];

const avatarForGlucose = (value) => {
  if (value < 70 || value > 180) return "red";
  if (value < 80 || value >= 160) return "orange";
  return "green";
};

const aiReports = {
  green: {
    headline: "今日整體穩定，午前偏低需留意",
    summary: "今天大多數時間維持在目標範圍內，TIR 95%，整體節奏很好。需要留意的是午前接近 78 mg/dL 的偏低，建議比對活動量與用餐間隔。",
    insights: [
      { title: "早餐後爬升平緩", body: "9 點高峰約 142 mg/dL，沒有衝過 160，推測早餐 GI 偏低、餐後有適度活動。", icon: "餐", tone: "orange" },
      { title: "午前 78 mg/dL 偏低", body: "11 點附近曾降到 78，雖然還在目標範圍但接近下緣，可能和上午活動量大、空腹太久有關。", icon: "低", tone: "red" },
      { title: "晚間血糖回穩", body: "晚餐後峰值控制在 134，餐後曲線平滑下降，控分量做得很好。", icon: "勢", tone: "blue" },
    ],
    causes: "AI 推測偏低可能和上午活動量、早餐間隔太久或藥物作用尾端有關；穩定區間則受惠於每餐都搭配蛋白質與纖維、餐後步行的習慣。",
    actions: "維持目前節奏。午前可在 10:30 補一份高蛋白點心（無糖優格＋堅果）避免空腹低點。",
  },
  orange: {
    headline: "餐後血糖自然爬升，預計 30 分鐘內回穩",
    summary: "今天 TIR 86%，整體節奏穩定。目前 155 mg/dL 是剛吃完飯的正常生理反應，Beta 預測 30 分鐘內會回到 130 以下。",
    insights: [
      { title: "用餐後緩升屬於正常", body: "餐後 30–60 分鐘血糖上升 30–50 mg/dL 是健康範圍，重點是看升降斜率而不是絕對值。", icon: "餐", tone: "orange" },
      { title: "30 分鐘預測：將回穩", body: "Beta AI 引擎以你近 7 天 CGM 序列推算，預測 30 分鐘後血糖會降到 124 ± 8 mg/dL，無需介入。", icon: "預", tone: "blue" },
      { title: "可選做：飯後散步", body: "輕度活動會再削減餐後 10–20 mg/dL 高峰，更接近最佳曲線；非必要動作。", icon: "走", tone: "blue" },
    ],
    causes: "AI 推測本次上升和正餐碳水比例（約 50%）、用餐速度（約 18 分鐘）一致，落在你個人化基線範圍內，不視為異常。",
    actions: "目前不需特殊處理。可選擇散步 10 分鐘讓曲線更平緩；若 90 分鐘後仍超過 180，再啟動高血糖照護流程。",
  },
  red: {
    headline: "已超出建議範圍，請依照護計畫處理",
    summary: "今天 TIR 只有 58%，凌晨曾掉到 62 mg/dL（低血糖），下午到傍晚出現雙高峰，最高 218 mg/dL。目前 202 mg/dL 仍超出建議範圍，請優先處理。",
    insights: [
      { title: "凌晨 4 點低血糖事件", body: "凌晨曾跌到 62 mg/dL，可能和睡前胰島素或服藥劑量、夜間活動有關，請務必紀錄今晚再次發生與否。", icon: "低", tone: "red" },
      { title: "下午雙高峰", body: "下午 4 點 196、傍晚 6 點 218，連續兩次超過 180，可能是用餐量過大、活動量不足或藥物時間錯位。", icon: "峰", tone: "orange" },
      { title: "波動幅度過大", body: "全日波動 156 mg/dL（62 → 218），高低差大會增加心血管與神經併發症風險，需要儘快和醫師討論。", icon: "勢", tone: "red" },
    ],
    causes: "AI 推測：（1）夜間用藥/胰島素時間或劑量需檢視；（2）下午餐量、碳水比例、餐後活動三者疊加導致雙高峰；（3）情緒或壓力造成的血糖反應也不能排除。",
    actions: "請先依個人照護計畫處理目前高血糖（補水、依指示調整）。建議今晚睡前提早確認血糖、明日聯絡你的醫師或衛教師回顧今日紀錄。如出現意識模糊、嘔吐、呼吸異常請立即就醫。",
  },
};

const restaurants = [
  {
    name: "穩穩食堂",
    distance: "350 m",
    rating: "4.8",
    dishes: ["雞胸溫沙拉", "半飯糙米便當", "無糖豆漿"],
    note: "12 位貝友回報：餐後 2 小時多維持在目標範圍。",
    breakdown: [
      { label: "餐後血糖反應", score: 4.9 },
      { label: "客製化彈性", score: 4.8 },
      { label: "食材新鮮度", score: 4.7 },
      { label: "用餐環境", score: 4.6 },
    ],
    voices: [
      "「半飯糙米便當吃完 2 小時血糖只升 22，真的很穩。」— T2D 6 年用戶",
      "「願意幫我把飯量再砍半，店員不會白眼。」— T1D 用戶",
      "「無糖豆漿是真的無糖，我餐前測過了。」— 衛教師見證",
    ],
  },
  {
    name: "小禾低 GI 廚房",
    distance: "620 m",
    rating: "4.3",
    dishes: ["藜麥鮭魚碗", "蔬菜加量", "飯量半份"],
    note: "多數回饋指出上升較平緩，適合午餐時段。",
    breakdown: [
      { label: "餐後血糖反應", score: 4.5 },
      { label: "客製化彈性", score: 4.3 },
      { label: "食材新鮮度", score: 4.4 },
      { label: "用餐環境", score: 4.0 },
    ],
    voices: [
      "「藜麥取代白飯後，2 小時峰值降 30 mg/dL。」— T2D 用戶",
      "「店面比較小、要排隊，但餐點品質穩定。」— 一般用戶",
      "「醬料偏甜可請店家少放，要主動講。」— T1D 用戶",
    ],
  },
  {
    name: "慢慢吃早午餐",
    distance: "900 m",
    rating: "4.6",
    dishes: ["蛋白質拼盤", "酪梨蛋沙拉", "無糖優格"],
    note: "貝友建議：醬料分開放，飯後血糖較穩。",
    breakdown: [
      { label: "餐後血糖反應", score: 4.7 },
      { label: "客製化彈性", score: 4.6 },
      { label: "食材新鮮度", score: 4.8 },
      { label: "用餐環境", score: 4.5 },
    ],
    voices: [
      "「酪梨蛋沙拉早餐後血糖一直線。」— T1D 用戶",
      "「店家會主動把醬料分開放，加分。」— 衛教師見證",
      "「無糖優格選歐式那款比希臘式更平穩。」— 飲控達人",
    ],
  },
];

function ratingTier(rating) {
  return parseFloat(rating) >= 4.5 ? "top" : "mid";
}

const peers = [
  {
    name: "慧敏",
    tag: "T2D 5 年",
    avatar: "./assets/peer-huimin.png",
    body: "週末會去打高爾夫，家裡養了兩隻荷蘭兔，喜歡記錄餐後散步前後的血糖差異。",
    matches: [
      "和你一樣在觀察早餐後 90 分鐘血糖",
      "球場用餐時段曾出現相似的下午高峰",
    ],
  },
  {
    name: "衣珊",
    tag: "T1D 12 年",
    avatar: "./assets/peer-yishan.png",
    body: "全職股票投資人，盯盤時容易忘記吃飯，最近在試「開盤前先補蛋白質」的方案。",
    matches: [
      "和你一樣留意壓力與血糖的連動",
      "上午 10 點時段血糖波動模式接近",
    ],
  },
];

const circles = [
  {
    title: "Beta 早餐圈",
    members: "1,248 位成員",
    body: "分享低 GI 早餐、份量調整與餐後曲線。",
    tone: "orange",
    emoji: "🌅",
  },
  {
    title: "飯後散步隊",
    members: "856 位成員",
    body: "找附近貝友一起完成 10-15 分鐘輕鬆步行。",
    tone: "green",
    emoji: "🚶‍♀️",
  },
  {
    title: "夜間低點守望",
    members: "392 位成員",
    body: "討論睡前點心、警示設定與夜間照護經驗。",
    tone: "blue",
    emoji: "🌙",
  },
];

const posts = [
  {
    author: "穩穩食堂實測",
    badge: "餐後回報",
    content: "今天選半飯糙米便當，加一份青菜，餐後 2 小時從 104 到 142，沒有明顯尖峰。",
    reactions: "32 人覺得有幫助",
  },
  {
    author: "下午點心觀察",
    badge: "經驗分享",
    content: "無糖優格加堅果比餅乾穩很多，但份量太大還是會慢慢上升。",
    reactions: "18 則回覆",
  },
];

const meals = [
  {
    type: "晚餐",
    name: "糙米便當（半飯）",
    time: "19:00",
    tags: ["半飯", "高纖"],
    before: 96,
    after1h: 130,
    after2h: 112,
    trend: "穩定",
    tone: "green",
  },
  {
    type: "點心",
    name: "全麥三明治 + 拿鐵",
    time: "15:30",
    tags: ["高碳", "外食"],
    before: 102,
    after1h: 168,
    after2h: 142,
    trend: "出現高峰",
    tone: "orange",
  },
  {
    type: "午餐",
    name: "雞胸肉沙拉",
    time: "12:30",
    tags: ["低碳", "高蛋白"],
    before: 95,
    after1h: 118,
    after2h: 105,
    trend: "穩定",
    tone: "green",
  },
  {
    type: "早餐",
    name: "燕麥粥 + 無糖豆漿",
    time: "08:00",
    tags: ["低 GI", "外食"],
    before: 88,
    after1h: 125,
    after2h: 108,
    trend: "緩升回穩",
    tone: "yellow",
  },
];

const screen = document.querySelector("#screen");
const tabButtons = [...document.querySelectorAll(".tab-button")];

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const chipRow = (items) => `
  <div class="filter-row">
    ${items
      .map((item, i) =>
        i === 0
          ? `<span class="chip active">${esc(item)}</span>`
          : `<button type="button" class="chip" data-action="dev">${esc(item)}</button>`
      )
      .join("")}
  </div>
`;

const metric = (title, value, unit, color = "") => `
  <article class="metric-card">
    <small>${esc(title)}</small>
    <div class="metric-value" style="${color ? `color:${color}` : ""}">${esc(value)}</div>
    <div class="unit">${esc(unit)}</div>
  </article>
`;

const insightCard = ({ title, body, icon, tone }) => `
  <article class="card insight-card">
    <div class="icon-tile ${tone}">${esc(icon)}</div>
    <div>
      <h3>${esc(title)}</h3>
      <p>${esc(body)}</p>
    </div>
  </article>
`;

const restaurantCard = (restaurant, idx) => {
  const tier = ratingTier(restaurant.rating);
  return `
  <button class="card restaurant-card" type="button" data-action="restaurant" data-idx="${idx}">
    <div class="row-between">
      <div>
        <h3>${esc(restaurant.name)}</h3>
        <p>${esc(restaurant.distance)}</p>
      </div>
      <span class="rating tier-${tier}">★ ${esc(restaurant.rating)}</span>
    </div>
    <div>
      <span class="muted-label">推薦餐點</span>
      <div class="tag-stack" style="margin-top: 8px">
        ${restaurant.dishes.map((dish) => `<span class="mini-tag">${esc(dish)}</span>`).join("")}
      </div>
    </div>
    <p>👥 ${esc(restaurant.note)} <span class="restaurant-cta">看評分原因 →</span></p>
  </button>
`;
};

const glucoseChart = () => {
  const chartValues = currentProfile().chart;
  const min = 50;
  const max = 230;
  const width = 360;
  const height = 188;
  const left = 44;
  const right = 12;
  const top = 12;
  const bottom = 30;
  const plotW = width - left - right;
  const plotH = height - top - bottom;
  const points = chartValues.map((value, index) => {
    const x = left + (plotW * index) / (chartValues.length - 1);
    const y = top + plotH * (1 - (value - min) / (max - min));
    return { x, y, value };
  });

  const segments = points.slice(0, -1).map((point, index) => {
    const next = points[index + 1];
    const high = Math.max(point.value, next.value);
    const low = Math.min(point.value, next.value);
    const color = high >= 180 ? "#df2929" : low <= 70 ? "#ef8e21" : high >= 160 ? "#ef8e21" : "#16864b";
    const width = high >= 180 ? 5 : 4.2;
    const prev = points[Math.max(index - 1, 0)];
    const after = points[Math.min(index + 2, points.length - 1)];
    const c1x = point.x + (next.x - prev.x) / 6;
    const c1y = point.y + (next.y - prev.y) / 6;
    const c2x = next.x - (after.x - point.x) / 6;
    const c2y = next.y - (after.y - point.y) / 6;
    return `<path d="M ${point.x} ${point.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${next.x} ${next.y}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
  });

  const highIdx = chartValues.indexOf(Math.max(...chartValues));
  const lowIdx = chartValues.indexOf(Math.min(...chartValues));
  const lastIdx = chartValues.length - 1;
  const markerIdx = Array.from(new Set([3, highIdx, lowIdx, lastIdx])).sort((a, b) => a - b);
  const markers = markerIdx
    .map((index) => {
      const point = points[index];
      const isLast = index === lastIdx;
      const fill = isLast ? "#101615" : point.value >= 180 ? "#ff3030" : point.value <= 70 ? "#ef8e21" : "#2c8dd8";
      return `<circle cx="${point.x}" cy="${point.y}" r="${isLast ? 8 : 7}" fill="${fill}" stroke="#fff" stroke-width="4" />`;
    })
    .join("");

  return `
    <article class="card chart-card">
      <div class="card-header">
        <h3>血糖波動圖</h3>
        <span class="muted-label">mg/dL</span>
      </div>
      <div class="chart-wrap">
        <div class="target-zone"></div>
        <span class="axis-label high">180</span>
        <span class="axis-label low">70</span>
        <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="今日血糖波動折線圖">
          <line x1="${left}" y1="${height - bottom}" x2="${width - right}" y2="${height - bottom}" stroke="rgba(32, 55, 46, 0.25)" />
          ${segments.join("")}
          ${markers}
        </svg>
        <div class="time-labels">
          <span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>
        </div>
      </div>
    </article>
  `;
};

function predictionWidget(profile) {
  const now = profile.glucose;
  // build past 30 min (last 6 chart points) + next 30 min predictions
  const past = profile.chart.slice(-6);
  // simple realistic projection per state
  const futureByState = {
    green: [now, now - 4, now - 6, now - 5, now - 2, now],
    orange: [now + 4, now + 2, now - 6, now - 16, now - 24, now - 30],
    red: [now + 4, now + 6, now + 4, now - 2, now - 8, now - 14],
  };
  const future = futureByState[activeState];
  const all = [...past, ...future];
  const min = Math.min(...all) - 12;
  const max = Math.max(...all) + 12;
  const w = 320, h = 110, pad = 8;
  const xPast = past.map((_, i) => pad + ((w - pad * 2) * 0.5 * i) / (past.length - 1));
  const xFuture = future.map((_, i) => pad + (w - pad * 2) * 0.5 + ((w - pad * 2) * 0.5 * i) / (future.length - 1));
  const yScale = (v) => pad + (h - pad * 2) * (1 - (v - min) / (max - min));
  const ptStr = (xs, ys) => xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${ys[i].toFixed(1)}`).join(" ");
  const yPast = past.map(yScale);
  const yFuture = future.map(yScale);
  const splitX = pad + (w - pad * 2) * 0.5;
  const conf = future.map((v, i) => {
    const span = 3 + i * 2.5;
    return { upper: yScale(v + span), lower: yScale(v - span) };
  });
  const confArea = `M ${xFuture[0]} ${conf[0].upper} ` +
    xFuture.map((x, i) => `L ${x.toFixed(1)} ${conf[i].upper.toFixed(1)}`).join(" ") +
    ` ` + xFuture.slice().reverse().map((x, i) => {
      const idx = xFuture.length - 1 - i;
      return `L ${x.toFixed(1)} ${conf[idx].lower.toFixed(1)}`;
    }).join(" ") + " Z";

  const predicted = future[future.length - 1];
  const direction = predicted < now - 5 ? "回穩" : predicted > now + 5 ? "持續上升" : "維持";
  const pillTone = activeState === "red" ? "red" : activeState === "orange" ? "orange" : "green";

  return `
    <article class="card prediction-card">
      <div class="row-between">
        <div>
          <h3>未來 30 分鐘預測</h3>
          <p class="prediction-sub">Beta AI 引擎・準確度 92.3%</p>
        </div>
        <span class="prediction-badge ${pillTone}">→ ${predicted} mg/dL</span>
      </div>
      <svg class="prediction-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="未來 30 分鐘血糖預測">
        <line x1="${splitX}" y1="${pad}" x2="${splitX}" y2="${h - pad}" stroke="rgba(140, 110, 70, 0.3)" stroke-dasharray="3 3"/>
        <path d="${confArea}" fill="rgba(239, 124, 42, 0.18)" stroke="none"/>
        <path d="${ptStr(xPast, yPast)}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${ptStr(xFuture, yFuture)}" fill="none" stroke="var(--beta)" stroke-width="2.5" stroke-dasharray="5 4" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${xPast[xPast.length - 1].toFixed(1)}" cy="${yPast[yPast.length - 1].toFixed(1)}" r="4" fill="var(--ink)"/>
        <circle cx="${xFuture[xFuture.length - 1].toFixed(1)}" cy="${yFuture[yFuture.length - 1].toFixed(1)}" r="5" fill="var(--beta)" stroke="#fff" stroke-width="2"/>
      </svg>
      <div class="prediction-legend">
        <span><span class="dot ink"></span>過去 30 分</span>
        <span><span class="dot beta"></span>AI 預測（含 95% 信心區間）</span>
      </div>
      <p class="prediction-summary">預測 30 分鐘後將${esc(direction)}至 <strong>${predicted} ± ${activeState === "red" ? 14 : 8} mg/dL</strong>。提早察覺、提早因應，是 Beta 引擎最在意的事。</p>
    </article>
  `;
}

function aiEngineSection() {
  return `
    <article class="card pro-report-card">
      <div class="pro-report-head">
        <span class="report-tag">醫療版專屬</span>
        <h4>專業血糖報告（PDF）</h4>
        <p>結合 7 / 14 / 28 天 CGM、飲食與活動紀錄，自動生成符合 ATTD 國際共識的標準血糖報告，可直接交付醫師、衛教師、營養師。</p>
      </div>

      <div class="pro-report-preview" aria-label="專業報告預覽">
        <div class="prp-page">
          <div class="prp-page-header">
            <div>
              <strong>Beta CGM Report</strong>
              <span>2026/04/26 – 2026/05/02</span>
            </div>
            <span class="prp-tir">TIR 86%</span>
          </div>
          <div class="prp-row">
            <span class="prp-label">平均血糖 (eA1C)</span>
            <span class="prp-val">128 mg/dL · 6.1%</span>
          </div>
          <div class="prp-row">
            <span class="prp-label">變異係數 (CV)</span>
            <span class="prp-val">28.4% <small>(目標 ≤ 36%)</small></span>
          </div>
          <div class="prp-row">
            <span class="prp-label">低血糖事件</span>
            <span class="prp-val">3 次 / 共 42 分鐘</span>
          </div>
          <div class="prp-row">
            <span class="prp-label">餐後高峰中位數</span>
            <span class="prp-val">+38 mg/dL · 65 min</span>
          </div>
          <svg class="prp-curve" viewBox="0 0 200 36" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 26 Q 16 8, 32 14 T 64 18 T 96 10 T 128 22 T 160 14 T 200 18" fill="none" stroke="var(--beta)" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>

      <ul class="pro-report-list">
        <li><strong>臨床指標</strong>：TIR / TBR / TAR、GMI、CV、SD</li>
        <li><strong>時段分析</strong>：日間 / 夜間、餐前 / 餐後、運動時段</li>
        <li><strong>事件摘要</strong>：低血糖、急升、夜間警示與時間軸</li>
        <li><strong>趨勢比較</strong>：本週 vs 上週 vs 月平均</li>
        <li><strong>共享格式</strong>：PDF（彩色 / 黑白）、AGP 圖、CSV 原始資料</li>
      </ul>

      <button class="pro-report-cta" type="button" data-action="paywall">查看完整報告範本</button>
    </article>
  `;
}

const pages = {
  home: () => {
    const profile = currentProfile();
    const todayHigh = Math.max(...profile.chart);
    const todayLow = Math.min(...profile.chart);
    const reminderText =
      activeState === "green"
        ? "血糖目前穩定，若準備運動可先再次確認 CGM 與身體感受。"
        : activeState === "orange"
          ? "餐後緩升屬正常範圍，Beta AI 預測 30 分鐘內回穩；散步 10 分鐘會更舒服。"
          : "已超出建議範圍，請依照個人照護計畫處理，並注意是否需要補水或聯絡照護者。";
    return `
    <section class="page">
      <article class="hero">
        <span class="eyebrow">小貝陪你日常</span>
        <h1>${esc(profile.greeting)}</h1>
        <p class="hero-slogan">不只控糖，更懂你的生活</p>
        <p style="margin-top: 8px">${esc(profile.greetingSub)}</p>
      </article>

      <article class="card glucose-card">
        <div>
          <span class="muted-label">即時血糖</span>
          <div class="glucose-value"><strong>${profile.glucose}</strong><span class="unit">mg/dL</span></div>
          <span class="trend ${activeState}">${esc(profile.trend)}</span>
          <button class="state-toggle" type="button" data-action="cycle-state">模擬下一個狀態</button>
        </div>
        <img
          class="avatar"
          src="./assets/avatar-${activeState}.png"
          alt="目前血糖狀態角色"
        />
      </article>

      <div class="chips">
        ${profile.chips
          .map((chip) => `<span class="chip ${chip.tone}">${esc(chip.label)}</span>`)
          .join("")}
      </div>

      ${glucoseChart()}

      <div class="metric-row">
        ${metric("目標範圍時間", String(profile.tir), "%", "var(--green)")}
        ${metric("今日最高", String(todayHigh), "mg/dL", todayHigh >= 180 ? "var(--red)" : "var(--orange)")}
        ${metric("今日最低", String(todayLow), "mg/dL", todayLow <= 70 ? "var(--red)" : "var(--orange)")}
      </div>

      <article class="card">
        <h3>AI 小提醒</h3>
        <p>${esc(reminderText)}</p>
      </article>
    </section>
  `;
  },

  ai: () => {
    const profile = currentProfile();
    const report = aiReports[activeState];
    const high = Math.max(...profile.chart);
    const tirColor = profile.tir >= 90 ? "var(--green)" : profile.tir >= 70 ? "var(--orange)" : "var(--red)";
    const highColor = high >= 180 ? "var(--red)" : "var(--orange)";
    const samplePrompt = activeState === "green"
      ? "例如：午前偏低該怎麼避免？"
      : activeState === "orange"
        ? "例如：下午點心怎麼換比較穩？"
        : "例如：高血糖時可以喝什麼補水？";
    return `
    <section class="page">
      <article class="hero">
        <span class="eyebrow">AI 血糖洞察</span>
        <h1>今天的血糖報告</h1>
        <p style="margin-top: 8px">已分析今日 CGM 模擬紀錄，幫你整理出高峰、低點與可能影響因素。</p>
      </article>

      <div class="metric-row">
        ${metric("目前", String(profile.glucose), "mg/dL", "var(--beta-dark)")}
        ${metric("範圍內", String(profile.tir), "%", tirColor)}
        ${metric("最高", String(high), "mg/dL", highColor)}
      </div>

      <article class="card">
        <h3>今日關鍵洞察</h3>
        <p style="font-weight: 800; color: var(--ink); margin-bottom: 6px">${esc(report.headline)}</p>
        <p>${esc(report.summary)}</p>
      </article>

      ${predictionWidget(profile)}

      ${report.insights.map(insightCard).join("")}

      <article class="card">
        <h3>可能原因</h3>
        <p>${esc(report.causes)}</p>
      </article>

      <article class="card">
        <h3>建議行動</h3>
        <p>${esc(report.actions)}</p>
      </article>

      ${aiEngineSection()}

      <button class="card ask-ai-card" type="button" data-action="paywall">
        <div class="row-between" style="margin-bottom: 6px">
          <h3>問問 AI</h3>
          <span class="usage-badge">免費剩 0 / 3 次</span>
        </div>
        <div class="chat-input">
          <span>${esc(samplePrompt)}</span>
          <span class="send-button" aria-hidden="true">➜</span>
        </div>
      </button>

      <p class="disclaimer">AI 建議僅供日常血糖管理參考，不能取代醫師、營養師或糖尿病衛教師的專業醫療建議。</p>
    </section>
  `;
  },

  map: () => `
    <section class="page">
      <article class="hero">
        <span class="eyebrow">貝友友善地圖</span>
        <h1>找附近較穩定的餐點選擇</h1>
        <p style="margin-top: 8px">以合作商家、用戶血糖回饋與可客製化餐點為主，降低點餐時的不確定感。</p>
      </article>

      ${chipRow(["低碳", "低 GI", "高蛋白", "飯量可調", "用戶推薦"])}

      <div class="soft-map" aria-label="貝友友善合作商家地圖">
        <span class="map-park" style="left: 8%; top: 8%">
          <span class="park-icon">🌳</span><span class="park-icon">🌲</span><span class="park-icon">🌳</span>
          <span class="park-label">中山公園</span>
        </span>
        <span class="map-block" style="left: 78%; top: 8%">
          <span class="block-icon">🏫</span>
          <span class="block-label">和平國小</span>
        </span>
        <span class="map-block" style="left: 14%; top: 76%">
          <span class="block-icon">🏥</span>
          <span class="block-label">市立醫院</span>
        </span>
        <span class="map-block" style="left: 84%; top: 78%">
          <span class="block-icon">🏪</span>
          <span class="block-label">超商</span>
        </span>
        <span class="map-block" style="left: 24%; top: 22%">
          <span class="block-icon">☕</span>
        </span>
        <span class="map-block" style="left: 70%; top: 56%">
          <span class="block-icon">🍱</span>
        </span>

        <span class="map-house" style="left: 22%; top: 56%">🏠</span>
        <span class="map-house" style="left: 78%; top: 36%">🏠</span>
        <span class="map-house" style="left: 36%; top: 80%">🏡</span>
        <span class="map-house" style="left: 60%; top: 18%">🏡</span>
        <span class="map-house" style="left: 16%; top: 38%">🏠</span>

        <span class="road"></span>
        <span class="road vertical"></span>
        <span class="road-label" style="left: 8%; top: 55%">和平東路</span>
        <span class="road-label vertical" style="left: 51%; top: 6%">復興街</span>

        <span class="me-dot" title="你在這">
          <span class="me-dot-inner">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white" aria-hidden="true">
              <path d="M12 2 L19 20 L12 16 L5 20 Z"/>
            </svg>
          </span>
          <span class="me-dot-label">你在這</span>
        </span>

        <button class="map-pin" type="button" data-action="restaurant" data-idx="0" style="left: 26%; top: 32%">
          <span class="pin tier-${ratingTier(restaurants[0].rating)}">★ ${esc(restaurants[0].rating)}</span>
          <span class="pin-name">${esc(restaurants[0].name)}</span>
        </button>
        <button class="map-pin" type="button" data-action="restaurant" data-idx="1" style="left: 66%; top: 30%">
          <span class="pin tier-${ratingTier(restaurants[1].rating)}">★ ${esc(restaurants[1].rating)}</span>
          <span class="pin-name">${esc(restaurants[1].name)}</span>
        </button>
        <button class="map-pin" type="button" data-action="restaurant" data-idx="2" style="left: 44%; top: 66%">
          <span class="pin tier-${ratingTier(restaurants[2].rating)}">★ ${esc(restaurants[2].rating)}</span>
          <span class="pin-name">${esc(restaurants[2].name)}</span>
        </button>
      </div>

      <h2 class="section-title">附近合作商家</h2>
      ${restaurants.map((r, i) => restaurantCard(r, i)).join("")}
    </section>
  `,

  community: () => `
    <section class="page">
      <article class="hero">
        <span class="eyebrow">貝友社群</span>
        <h1>找懂你日常的人</h1>
        <p style="margin-top: 8px">用餐、運動、睡眠和情緒都會影響血糖。這裡讓貝友用安全、友善的方式交換經驗。</p>
      </article>

      ${chipRow(["附近貝友", "餐後分享", "運動夥伴", "新手友善", "夜間互助"])}

      <button class="card insight-card community-prompt" type="button" data-action="dev">
        <span class="icon-tile orange pencil-tile" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z"/>
          </svg>
        </span>
        <span class="prompt-body">
          <h3>想寫點什麼？</h3>
          <p>分享一餐、一次運動或一個血糖觀察，系統會幫你隱藏敏感資訊，只留下對社群有幫助的重點。</p>
        </span>
      </button>

      <h2 class="section-title">推薦貝友</h2>
      ${peers
        .map(
          (peer) => `
            <article class="card peer-card">
              <img class="peer-avatar" src="${esc(peer.avatar)}" alt="${esc(peer.name)} 的頭像" />
              <div>
                <h3>${esc(peer.name)}</h3>
                <p>${esc(peer.body)}</p>
                ${peer.matches
                  .map(
                    (m) => `<p class="peer-match">✦ ${esc(m)}</p>`,
                  )
                  .join("")}
              </div>
              <button class="plus-btn" type="button" data-action="dev" aria-label="加為好友">+</button>
            </article>
          `,
        )
        .join("")}

      <h2 class="section-title">互助圈</h2>
      ${circles
        .map(
          (c) => `
            <button class="card insight-card circle-card" type="button" data-action="dev">
              <span class="circle-emoji ${c.tone}">${c.emoji}</span>
              <span class="circle-body">
                <span class="row-between">
                  <h3>${esc(c.title)}</h3>
                  <span class="unit">${esc(c.members)}</span>
                </span>
                <p>${esc(c.body)}</p>
              </span>
            </button>
          `,
        )
        .join("")}

      <h2 class="section-title">今日分享</h2>
      ${posts
        .map(
          (post) => `
            <article class="card post-card">
              <div>
                <h3>${esc(post.author)}</h3>
                <span class="unit">${esc(post.badge)}</span>
              </div>
              <p style="color: var(--ink)">${esc(post.content)}</p>
              <div class="row-between">
                <span class="unit">👍 ${esc(post.reactions)}</span>
                <button class="mini-tag mini-tag-btn" type="button" data-action="dev">回覆</button>
              </div>
            </article>
          `,
        )
        .join("")}

      <p class="disclaimer">建議預設匿名分享，不公開精確位置、電話、完整病歷或用藥劑量。社群內容是生活經驗交流，不應作為診斷、治療或用藥調整依據。</p>
    </section>
  `,

  record: () => `
    <section class="page record-page">
      <div class="record-header">
        <div>
          <h1>餐點紀錄</h1>
          <p class="record-subtitle">追蹤飲食與血糖反應</p>
        </div>
        <button class="record-add-btn" type="button" data-action="dev" aria-label="新增餐點">+</button>
      </div>

      <button class="add-meal-card" type="button" data-action="dev">
        <span class="camera-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </span>
        <span>拍照記錄新餐點</span>
      </button>

      ${meals.map(mealCard).join("")}

      <article class="card record-summary">
        <h3>今日飲食洞察</h3>
        <p>下午點心讓血糖上升 66 mg/dL，是今天波動最大的時段。建議下次：先吃半份、改點無糖飲品，並在餐後 10 分鐘輕鬆散步。</p>
        <div class="summary-stat-row">
          <div class="summary-stat">
            <span class="summary-stat-label">今日餐次</span>
            <span class="summary-stat-value">${meals.length}</span>
          </div>
          <div class="summary-stat">
            <span class="summary-stat-label">穩定餐次</span>
            <span class="summary-stat-value good">${meals.filter((m) => m.tone === "green").length}</span>
          </div>
          <div class="summary-stat">
            <span class="summary-stat-label">需留意</span>
            <span class="summary-stat-value warn">${meals.filter((m) => m.tone !== "green").length}</span>
          </div>
        </div>
      </article>

      <p class="disclaimer">餐點紀錄為使用者自行回報，AI 提示僅供日常飲食參考。Beta 不會把你的飲食照片或內容提供給第三方。</p>
    </section>
  `,

  device: () => `
    <section class="page device-page">
      <article class="hero">
        <span class="eyebrow">CGM 裝置連線</span>
        <h1>連接你的 CGM 感測器</h1>
        <p style="margin-top: 8px">透過藍牙與你的 CGM 配對，Beta 才能讀取即時血糖並啟動 AI 預測。</p>
      </article>

      <article class="card bt-status-card">
        <div class="bt-pulse-wrap">
          <span class="bt-pulse"></span>
          <span class="bt-pulse delay"></span>
          <span class="bt-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11"/>
            </svg>
          </span>
        </div>
        <h3>藍牙搜尋中…</h3>
        <p>請確認你的 CGM 已開機，並靠近手機 1 公尺內。</p>
        <button class="bt-rescan" type="button" data-action="dev">重新搜尋</button>
      </article>

      <h2 class="section-title">附近的 CGM 裝置</h2>

      <button class="card device-item" type="button" data-action="connect-cgm">
        <span class="device-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </span>
        <div class="device-body">
          <div class="device-name-row">
            <h3>Bionime CGM-T1</h3>
            <span class="signal-pill strong">訊號強</span>
          </div>
          <p>序號 BN-3F-A892　·　電量 78%　·　已配對 12 天</p>
        </div>
        <span class="device-cta">已連線 →</span>
      </button>

      <button class="card device-item" type="button" data-action="dev">
        <span class="device-icon muted">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </span>
        <div class="device-body">
          <div class="device-name-row">
            <h3>Taidoc TD-4279</h3>
            <span class="signal-pill mid">訊號中</span>
          </div>
          <p>未配對　·　約 2.4 公尺</p>
        </div>
        <span class="device-cta connect">配對 +</span>
      </button>

      <button class="card device-item" type="button" data-action="dev">
        <span class="device-icon muted">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        </span>
        <div class="device-body">
          <div class="device-name-row">
            <h3>POCTech CT-100</h3>
            <span class="signal-pill weak">訊號弱</span>
          </div>
          <p>未配對　·　約 5 公尺　·　請靠近裝置</p>
        </div>
        <span class="device-cta connect">配對 +</span>
      </button>

    </section>
  `,
};

function mealCard(meal) {
  const points = [meal.before, meal.after1h, meal.after2h];
  const min = 60, max = 200;
  const w = 300, h = 60, pad = 4;
  const xs = points.map((_, i) => pad + (w - pad * 2) * (i / (points.length - 1)));
  const ys = points.map((v) => h - pad - (h - pad * 2) * ((v - min) / (max - min)));
  const c1x = xs[0] + (xs[1] - xs[0]) / 2;
  const c2x = xs[1] + (xs[2] - xs[1]) / 2;
  const path = `M ${xs[0]} ${ys[0]} C ${c1x} ${ys[0]}, ${c1x} ${ys[1]}, ${xs[1]} ${ys[1]} C ${c2x} ${ys[1]}, ${c2x} ${ys[2]}, ${xs[2]} ${ys[2]}`;
  const trendIcon = meal.tone === "green" ? "↗" : meal.tone === "orange" ? "⚠" : "📈";
  return `
    <button class="card meal-card" type="button" data-action="dev">
      <div class="meal-card-head">
        <div class="meal-title-block">
          <h3>${esc(meal.type)} － ${esc(meal.name)}</h3>
          <span class="meal-time">${esc(meal.time)}</span>
        </div>
        <div class="meal-tags">
          ${meal.tags.map((t) => `<span class="meal-tag">${esc(t)}</span>`).join("")}
        </div>
      </div>

      <div class="meal-stats">
        <div class="meal-stat">
          <span class="meal-stat-label">餐前</span>
          <span class="meal-stat-value">${meal.before}</span>
        </div>
        <div class="meal-stat">
          <span class="meal-stat-label">1 小時後</span>
          <span class="meal-stat-value ${meal.tone}">${meal.after1h}</span>
        </div>
        <div class="meal-stat">
          <span class="meal-stat-label">2 小時後</span>
          <span class="meal-stat-value">${meal.after2h}</span>
        </div>
      </div>

      <svg class="meal-curve ${meal.tone}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
        <path d="${path}" fill="none" stroke-width="3" stroke-linecap="round" />
      </svg>

      <div class="meal-footer">
        <span class="meal-trend ${meal.tone}">${trendIcon} ${esc(meal.trend)}</span>
        <span class="meal-arrow">→</span>
      </div>
    </button>
  `;
}

let currentPage = "home";
const visitedPages = new Set(["home"]);

const render = (pageName) => {
  const previousPage = currentPage;
  currentPage = pageName;
  screen.innerHTML = pages[pageName]();
  screen.scrollTo({ top: 0, behavior: "instant" });
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === pageName);
  });

  // First time entering AI page in this session: show paywall after a beat
  if (pageName === "ai" && previousPage !== "ai" && !visitedPages.has("ai")) {
    setTimeout(() => openPopup(paywallPopupRoot), 500);
  }
  visitedPages.add(pageName);
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => render(button.dataset.screen));
});

screen.addEventListener("click", (event) => {
  const cycle = event.target.closest("[data-action='cycle-state']");
  if (cycle) {
    const idx = stateOrder.indexOf(activeState);
    activeState = stateOrder[(idx + 1) % stateOrder.length];
    render(currentPage);
    if (activeState === "red") {
      setTimeout(() => openPopup(medicalPopupRoot), 280);
    }
    return;
  }
  const restaurantBtn = event.target.closest("[data-action='restaurant']");
  if (restaurantBtn) {
    const idx = parseInt(restaurantBtn.dataset.idx, 10);
    if (!Number.isNaN(idx) && restaurants[idx]) showRestaurant(restaurants[idx]);
    return;
  }
  const paywall = event.target.closest("[data-action='paywall']");
  if (paywall) {
    openPopup(paywallPopupRoot);
    return;
  }
  const cgm = event.target.closest("[data-action='connect-cgm']");
  if (cgm) {
    openPopup(cgmPopupRoot);
    return;
  }
  const dev = event.target.closest("[data-action='dev']");
  if (dev) openPopup(devPopupRoot);
});

const devPopupRoot = document.querySelector(".dev-popup-root");
const medicalPopupRoot = document.querySelector(".medical-popup-root");
const paywallPopupRoot = document.querySelector(".paywall-popup-root");
const cgmPopupRoot = document.querySelector(".cgm-popup-root");
const restaurantPopupRoot = document.querySelector(".restaurant-popup-root");
const restaurantPopupBody = restaurantPopupRoot?.querySelector(".restaurant-popup-body");
const settingsRoot = document.querySelector(".settings-root");
const loginRoot = document.querySelector(".login-root");
const onboardingRoot = document.querySelector(".onboarding-root");

function showRestaurant(r) {
  if (!restaurantPopupRoot || !restaurantPopupBody) return;
  const tier = ratingTier(r.rating);
  const tierLabel = tier === "top" ? "TOP TIER" : "MID TIER";
  restaurantPopupBody.innerHTML = `
    <div class="rest-popup-head">
      <div>
        <h3>${esc(r.name)}</h3>
        <div class="meta">${esc(r.distance)}　·　${r.breakdown.length} 項評分</div>
      </div>
      <div class="rest-popup-rating-big tier-${tier}">★ ${esc(r.rating)}<small>${tierLabel}</small></div>
    </div>

    <div class="rest-popup-section">
      <h4>為什麼是這個分數？</h4>
      ${r.breakdown
        .map((b) => {
          const pct = Math.round((b.score / 5) * 100);
          return `
            <div class="rest-popup-bar">
              <span class="label">${esc(b.label)}</span>
              <span class="track"><span class="fill" style="width: ${pct}%"></span></span>
              <span class="num">${b.score.toFixed(1)}</span>
            </div>
          `;
        })
        .join("")}
    </div>

    <div class="rest-popup-section">
      <h4>貝友怎麼說</h4>
      <ul class="rest-popup-voices">
        ${r.voices.map((v) => `<li>${esc(v)}</li>`).join("")}
      </ul>
    </div>

    <div class="rest-popup-cta-row">
      <button class="rest-popup-cta secondary" type="button" data-popup-close>先收藏</button>
      <button class="rest-popup-cta primary" type="button" data-action="dev">查看完整菜單</button>
    </div>
  `;
  openPopup(restaurantPopupRoot);
}

function openPopup(root) {
  if (!root) return;
  root.hidden = false;
  root.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => root.classList.add("visible"));
}

function closePopup(root) {
  if (!root) return;
  root.classList.remove("visible");
  setTimeout(() => {
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
  }, 200);
}

const allPopups = [devPopupRoot, medicalPopupRoot, restaurantPopupRoot, paywallPopupRoot, cgmPopupRoot, settingsRoot, loginRoot];

allPopups.forEach((root) => {
  if (!root) return;
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-popup-close]")) {
      closePopup(root);
      return;
    }
    const dev = event.target.closest("[data-action='dev']");
    if (dev && root !== devPopupRoot) {
      closePopup(root);
      setTimeout(() => openPopup(devPopupRoot), 220);
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  allPopups.forEach((root) => {
    if (root && !root.hidden) closePopup(root);
  });
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  });
}

// ====== 字體大小（持久化） ======
const FONT_SCALE_MAP = { sm: 0.88, md: 1, lg: 1.18, xl: 1.36 };
const FONT_KEY = "beta-font-size";

function applyFontSize(size) {
  const scale = FONT_SCALE_MAP[size] ?? 1;
  document.documentElement.style.setProperty("--font-scale", String(scale));
  document.querySelectorAll(".font-size-option").forEach((btn) => {
    const active = btn.dataset.fontSize === size;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-checked", active ? "true" : "false");
  });
  try { localStorage.setItem(FONT_KEY, size); } catch (e) {}
}

(function initFontSize() {
  let saved = "md";
  try { saved = localStorage.getItem(FONT_KEY) || "md"; } catch (e) {}
  if (!FONT_SCALE_MAP[saved]) saved = "md";
  applyFontSize(saved);
})();

document.addEventListener("click", (event) => {
  const btn = event.target.closest(".font-size-option");
  if (!btn) return;
  applyFontSize(btn.dataset.fontSize);
});

// ====== Settings + Login ======
document.addEventListener("click", (event) => {
  const openSet = event.target.closest("[data-action='open-settings']");
  if (openSet) { openPopup(settingsRoot); return; }
  const openLogin = event.target.closest("[data-action='open-login']");
  if (openLogin) {
    closePopup(settingsRoot);
    setTimeout(() => openPopup(loginRoot), 180);
    return;
  }
});

// settings panel 內部 click handler（其他 [data-action='dev']／[data-popup-close] 在下面共用 logic）
[settingsRoot, loginRoot].forEach((root) => {
  if (!root) return;
  root.addEventListener("click", (event) => {
    if (event.target.closest("[data-popup-close]")) {
      closePopup(root);
      return;
    }
    const dev = event.target.closest("[data-action='dev']");
    if (dev) {
      // 在 settings/login 裡按未開發按鈕：不關 panel，只彈 dev popup
      openPopup(devPopupRoot);
    }
  });
});

// ====== Onboarding ======
const ONBOARDING_KEY = "beta-onboarding-seen";
let onboardingStep = 0;
const onboardingTrack = onboardingRoot?.querySelector("[data-onboarding-track]");
const onboardingDots = onboardingRoot ? [...onboardingRoot.querySelectorAll(".ob-dot")] : [];
const onboardingNextBtn = onboardingRoot?.querySelector("[data-action='onboarding-next']");
const ONBOARDING_LAST = 3;

function renderOnboardingStep() {
  if (!onboardingTrack) return;
  onboardingTrack.querySelectorAll(".onboarding-slide").forEach((slide) => {
    slide.style.transform = `translateX(${-onboardingStep * 100}%)`;
  });
  onboardingDots.forEach((dot, i) => dot.classList.toggle("active", i === onboardingStep));
  if (onboardingNextBtn) {
    onboardingNextBtn.textContent = onboardingStep === ONBOARDING_LAST ? "開始使用 Beta" : "下一步";
  }
}

function openOnboarding() {
  if (!onboardingRoot) return;
  onboardingStep = 0;
  renderOnboardingStep();
  onboardingRoot.hidden = false;
  onboardingRoot.setAttribute("aria-hidden", "false");
  requestAnimationFrame(() => onboardingRoot.classList.add("visible"));
}

function closeOnboarding() {
  if (!onboardingRoot) return;
  onboardingRoot.classList.remove("visible");
  setTimeout(() => {
    onboardingRoot.hidden = true;
    onboardingRoot.setAttribute("aria-hidden", "true");
  }, 320);
  try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch (e) {}
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-action='onboarding-skip']")) {
    closeOnboarding();
    return;
  }
  if (event.target.closest("[data-action='onboarding-next']")) {
    if (onboardingStep < ONBOARDING_LAST) {
      onboardingStep += 1;
      renderOnboardingStep();
    } else {
      closeOnboarding();
    }
    return;
  }
  if (event.target.closest("[data-action='show-onboarding']")) {
    closePopup(settingsRoot);
    setTimeout(openOnboarding, 200);
  }
});

(function maybeShowOnboarding() {
  let seen = "0";
  try { seen = localStorage.getItem(ONBOARDING_KEY) || "0"; } catch (e) {}
  if (seen !== "1") {
    requestAnimationFrame(openOnboarding);
  }
})();

render("home");
