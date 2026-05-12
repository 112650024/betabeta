# Beta — 不只控糖，更懂你的生活

Beta CGM App 的靜態網頁示範版。部署到 Vercel 後拿網址做 QR code 給人掃描體驗。
配色：橘 #ef7c2a + 米色 #fcf6e9。

## 部署方法 A：Vercel CLI（最快，1 分鐘）

在 `web-demo/` 目錄底下執行：

```bash
cd /Users/kkkk/Desktop/app/502/web-demo
npx vercel              # 第一次會問幾題：登入 → 確認 scope → 專案名稱 → 直接 Enter 用預設
npx vercel --prod       # 把 preview 推上正式網址
```

第一次跑時，`vercel` 問 `In which directory is your code located?` 直接 Enter（用 `./`）。
其他問題（Build Command / Output Directory / Install Command）全部留空（按 Enter），因為這是純靜態。

完成後會印出 `https://穩糖-xxxx.vercel.app` 之類的網址，丟去 QR code 產生器即可。

## 部署方法 B：GitHub + Vercel Dashboard

1. 把整個 502 repo 推到 GitHub。
2. 到 https://vercel.com → Add New Project → 選 GitHub repo。
3. **Root Directory 一定要選 `web-demo`**（這是關鍵）。
4. Framework Preset：`Other`。
5. Build Command / Output Directory / Install Command 全部留空。
6. Deploy。

## Vercel 設定摘要

```text
Root Directory: web-demo
Framework Preset: Other
Build Command: 留空
Output Directory: 留空 或 .
Install Command: 留空
```

## 重新部署 / 換網址

CLI: `cd web-demo && npx vercel --prod`
Dashboard: 推 commit 到主分支會自動觸發。

## 內容組成

- `index.html` — 殼，固定的分頁 nav。
- `app.js` — 四個分頁的內容渲染、首頁三狀態（綠/橙/紅）切換、波動圖。
- `styles.css` — 視覺樣式。
- `assets/avatar-{green,orange,red}.png` — 已去背的貓頭鷹頭像。
- `service-worker.js` — 簡單的離線快取（PWA），更動內容時要 bump `CACHE_NAME`。
- `manifest.json` — PWA manifest（讓使用者可以「加到主畫面」）。

## 常見坑

- **改了內容看不到**：service worker 在快取，把 `service-worker.js` 裡的 `CACHE_NAME` 換版號（例如 v3 → v4）再重新部署，或在瀏覽器 DevTools → Application → Service Workers → Unregister。
- **404 on `/assets/...`**：check Root Directory 是 `web-demo`，不是 repo root。
- **首頁右下角貓頭鷹比例怪**：CSS `.avatar` 控制；目前 width: 104px / height: 124px，已對應去背 PNG。
