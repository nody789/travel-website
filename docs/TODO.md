# TODO — Travel Explorer 開發待辦清單

> 目標：做成面試用的上線作品集網站，部署在 Render 上。

---

## 🔴 P0 — 必做

- [x] 會員註冊頁 + API ✅
- [x] Google / LINE OAuth 憑證 ✅
- [x] 部署到 Render ✅（https://travel-website-9zah.onrender.com）
  - [x] Render env 補 `AUTH_TRUST_HOST=true`
  - [x] Google / LINE Callback URL 已更新

---

## 🟠 P1 — 重要

- [x] 首頁輪播 Banner（後台可控制）✅
- [x] 活動/事件管理（後台 + 前台）✅
- [x] Loading Skeleton 骨架畫面 ✅
- [x] 手機版 Navbar 漢堡選單 ✅

---

## 🟡 P2 — 加分

- [x] 客製化 404 頁面 ✅
- [x] Footer 頁尾 ✅
- [x] 首頁豐富化（統計數字、精選目的地、分類卡片、旅客心得、CTA）✅
- [x] 目的地卡片視覺升級（圖片覆蓋標籤、星星評分）✅
- [x] 目的地列表頁頭色塊 ✅
- [x] **個人資料編輯**（改名稱 / 上傳頭像）✅
- [ ] **OG Image**（分享到 LINE/FB 顯示目的地圖片）
- [x] **圖片上傳（Cloudinary）**（後台改為真正上傳）✅ — 需設定 CLOUDINARY_* 環境變數
- [x] **搜尋即時預覽**（dropdown）✅
- [x] **後台數據圖表**（儀表板折線圖，Recharts）✅

---

## 🟢 P3 — 上線安全性

- [ ] Rate Limiting（Upstash Redis，限制登入 API）
- [x] CSRF 防護（NextAuth.js 已內建）✅
- [x] 環境變數安全（.env 已在 .gitignore）✅

---

## 📋 後台功能清單

| 功能 | 狀態 |
|------|------|
| 儀表板（統計數字） | ✅ |
| 目的地管理（CRUD）| ✅ |
| 分類管理 | ✅ |
| 評論審核 | ✅ |
| 輪播 Banner 管理 | ✅ |
| 活動/事件管理 | ✅ |
| 使用者管理 | ❌ 待建立 |
