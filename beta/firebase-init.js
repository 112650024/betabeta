/* =========================================================================
   Firebase 設定檔  —  Beta CGM App
   -------------------------------------------------------------------------
   只要設定一次：
   1. 到 https://console.firebase.google.com 建立專案（不用開 Analytics）
   2. Authentication → 開始 → 啟用「電子郵件/密碼」
   3. Firestore Database → 建立資料庫（正式模式，區域選 asia-east1）
   4. 專案設定 → 一般 → 你的應用程式 → 點 Web </> → 複製那段 firebaseConfig
   5. 把下面每個 "PASTE_..." 換成你複製到的對應值（保留引號）
   6. Authentication → Settings → 授權網域，加入你的 vercel 網域與 localhost
   7. 到 Firebase 後台 Firestore → 規則，貼上本資料夾 firestore.rules 的內容

   註：這組金鑰放在前端是「安全的」。真正的防護來自 Firestore 安全規則 +
   登入狀態，不是靠把金鑰藏起來。
   ========================================================================= */

var firebaseConfig = {
  apiKey: "AIzaSyBlm55cf7Vo7WeUbggsbyJTfaSAEToMd60",
  authDomain: "betabeta-d7fb6.firebaseapp.com",
  projectId: "betabeta-d7fb6",
  storageBucket: "betabeta-d7fb6.firebasestorage.app",
  messagingSenderId: "395173078884",
  appId: "1:395173078884:web:51792da9a5e251e2d93c71",
};

(function () {
  var configured =
    typeof firebase !== "undefined" &&
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey.indexOf("PASTE_") !== 0;

  if (configured) {
    try {
      firebase.initializeApp(firebaseConfig);
      window.__BETA_FIREBASE_READY__ = true;
    } catch (e) {
      window.__BETA_FIREBASE_READY__ = false;
      console.error("[Beta] Firebase 初始化失敗：", e);
    }
  } else {
    window.__BETA_FIREBASE_READY__ = false;
    console.warn(
      "[Beta] 尚未設定 Firebase：請編輯 firebase-init.js 填入 firebaseConfig。" +
        "設定好之前，登入與社群發文會停用（其餘 demo 照常運作）。"
    );
  }
})();
