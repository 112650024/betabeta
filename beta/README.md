# Beta — 不只控糖，更懂你的生活

藍脈科技 **Beta CGM App** 的網頁示範版（創業比賽 Demo）。
線上：https://betabeta-zeta.vercel.app　｜　Repo：`112650024/betabeta`

> 這份 README 同時是**目前進度 + 待完成清單**。停電/換電腦後，從這裡接著做即可。
> 最後更新：2026-06-14

---

## ⚠️ 最重要：回來後第一件事（不做的話「回覆 / 私訊 / 加好友」會壞）

1. **發布最終 Firestore 規則**
   - Firebase 後台 → Firestore Database → **規則** → 全選刪除 → 貼上本專案 `firestore.rules` 整個內容 → **發布**
   - （目前線上規則還是舊版，只支援登入＋發文；回覆、私訊、加好友需要這份新規則）

2. **刪掉舊的測試帳號**
   - Firebase 後台 → Authentication → **使用者** → 把**不是** k/y/h/n@beta.com 的那一筆（你最早自己註冊測試的）刪除

3. 改完程式要上線時：把整包推回 GitHub（Vercel 會自動部署），並把 `service-worker.js` 的 `CACHE_NAME` 版號 +1。

---

## ✅ 已完成的功能

- **真帳號登入 / 註冊 / 登出**（Firebase Authentication，email+密碼）＋ 登入成功 toast 動畫
- **修改密碼**（個人介面內，需輸入目前密碼）
- **社群發文**：即時顯示、今日分享在最上面、一次顯示 3 則 +「看更多」、**可刪除自己的貼文**
- **回覆功能**（即時，含回覆數）
- **個人介面**（點設定裡的帳號列打開）：
  - 換頭貼（16 個 emoji 預設頭像挑選）
  - 改暱稱
  - 顯示 + 一鍵複製**我的 ID**
  - 我發過的貼文（可刪）
  - 登出
- **好友 ID 系統**：一般使用者註冊自動配發**隨機 4 碼 ID**；官方帳號為自訂 ID（001–004）
- **用 ID 加好友**：社群輸入對方 ID → 加好友
- **真・雙向私訊**（聊天室，參與者制 conversations，會即時同步）
- **官方金色閃亮徽章**：官方帳號在貼文/回覆/推薦貝友/個人頁/聊天標頭都會顯示 ★官方
- **Boss 管理面板**（只有 k@beta.com 看得到）：輸入某人 ID → 指派官方 ID（把他變官方帳號）
- **推薦貝友**：自動從資料庫撈「官方帳號」顯示
- 已建立 4 個團隊帳號 + 個人檔案 + 3 篇官方種子貼文（見下表）

## ⏳ 待完成 / 待測試清單（TODO）

- [ ] **（必做）發布最終 `firestore.rules`**（見最上方）
- [ ] **（必做）刪除舊測試帳號**
- [ ] 發布規則後，**實測新功能**（目前後端只驗證過登入＋發文；下列尚未在瀏覽器端對端實測）：
  - [ ] 登入 k@beta.com（密碼 123456）→ 看到 👑/★官方、ID 001
  - [ ] 改頭貼、改暱稱、複製 ID
  - [ ] 用 ID 互加好友（例：登入 k 加 002 衣珊）
  - [ ] 雙向私訊：兩個帳號互傳（可用兩個瀏覽器/無痕視窗各登一個）
  - [ ] 回覆貼文、刪除自己貼文
  - [ ] Boss 面板：把某隨機 ID 帳號指派成官方
- [ ] 把這版推上 GitHub → 確認 Vercel 自動部署成功 → 手機掃 QR 測一次
- [ ] （之後想做）私訊未讀提示 / 收件匣、上傳真實照片頭貼、把 `beta AI` 血糖預測模型接到首頁、推播通知

---

## 👥 團隊帳號（密碼都是 `123456`）

| Email | 名字 | ID | 角色 | 頭像 |
|---|---|---|---|---|
| k@beta.com | 吉拿棒 | 001 | 👑 Boss（可指派官方帳號 + 刪任何貼文） | 🦉 |
| y@beta.com | 衣珊 | 002 | ★ 官方（版主，可刪任何貼文） | 📈 |
| h@beta.com | 慧敏 | 003 | ★ 官方 | ⛳ |
| n@beta.com | han | 004 | ★ 官方 | 🌙 |

> Boss 用 **email 判斷**（程式與規則都寫死 `k@beta.com`）。要換 boss 就改 `firebase-init.js` 附近與 `firestore.rules` 裡的 email、`app.js` 的 `BOSS_EMAIL`。

---

## 🗂️ 檔案說明

| 檔案 | 內容 |
|---|---|
| `index.html` | 殼 + 所有彈窗（登入、發文、回覆、私訊、**個人介面**、設定…） |
| `app.js` | 全部邏輯。社群/好友/私訊/個人檔案集中在底部 `betaBackend` IIFE |
| `styles.css` | 視覺樣式 |
| `firebase-init.js` | Firebase 設定（已填入 betabeta-d7fb6 的金鑰；前端公開金鑰是安全的） |
| `firestore.rules` | **最終**資料庫安全規則（記得貼到後台發布） |
| `service-worker.js` | PWA 離線快取，改版要 bump `CACHE_NAME` |
| `manifest.json` / `assets/` | PWA manifest 與圖示/頭像 |

## 🧱 資料庫結構（Firestore）

- `users/{uid}`：`displayName, betaId, avatar(emoji), official(bool), role('boss'), bio, friends[], createdAt`
- `posts/{id}`：`uid, author, authorAvatar, authorOfficial, badge, content, reactions, replyCount, createdAt`
  - `posts/{id}/replies/{id}`：`uid, author, authorAvatar, authorOfficial, content, createdAt`
- `conversations/{convId}`：`participants[兩個uid排序], updatedAt`（convId = 兩個 uid 排序後用 `__` 連接）
  - `conversations/{convId}/messages/{id}`：`senderUid, senderName, text, createdAt`

## 🔧 Firebase 專案

- 專案：`betabeta-d7fb6`（Spark 免費方案，**不會閒置暫停**）
- 已啟用：Authentication（電子郵件/密碼）、Firestore（asia-east1）
- 授權網域要含：`betabeta-zeta.vercel.app`、`localhost`

---

## 💻 本機開發 / 測試

```powershell
cd C:\Users\lab643\Desktop\beta
python -m http.server 8000
# 瀏覽器開 http://localhost:8000   （改完按 Ctrl+Shift+R 強制重新整理）
```
> 一定要用 http://localhost，不能直接點開 index.html（file:// 無法登入 Firebase）。

## 🚀 部署（Vercel 自動）

GitHub repo `112650024/betabeta` 已連 Vercel，**push 到 main 就自動部署**。
（本機資料夾若已是 git repo：`git add -A && git commit -m "..." && git push`）

## 📌 注意 / 已知限制

- 私訊雙向是真的：對方要登入自己的帳號才看得到/回覆你（Demo 可用兩個視窗各登一個帳號）。
- 一般使用者目前理論上可自己改 official 欄位（規則為了簡化採 owner 可寫）；Demo 無妨，要嚴格再收緊。
- 隨機 4 碼 ID 沒做嚴格防撞號（Demo 機率極低）。
- 改 `firebase-init.js` 後不會被 service worker 快取（故意的），但改 `app.js`/`index.html`/`styles.css` 要 bump `CACHE_NAME`。
