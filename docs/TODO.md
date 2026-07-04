# TODO — Travel Explorer 開發待辦清單

> 目標：做成面試用的上線作品集網站，部署在 Render 上。
> 優先順序：⭐⭐⭐ 必做 → ⭐⭐ 重要 → ⭐ 加分

---

## 🔴 P0 — 必做（沒有這些面試官無法體驗）

- [x] **會員註冊頁** `app/auth/register/page.tsx` ✅
  - Email + 密碼 + 名稱表單
  - Zod 驗證（密碼長度、Email 格式）
  - 成功後自動導向登入
  - 對應 API：`POST /api/auth/register`

- [x] **Google / LINE OAuth 憑證申請並填入 .env** ✅
  - Google Client ID / Secret 已填入
  - LINE Client ID / Secret 已填入

- [ ] **部署到 Render**
  - [x] `render.yaml` 已建立
  - [x] `.gitignore` 已更新
  - [ ] `git init` → `git add .` → `git commit`
  - [ ] 建立 GitHub repo → `git push`
  - [ ] Render Dashboard → New Web Service → 連結 GitHub repo
  - [ ] 填入環境變數（見下方清單）
  - [ ] 等待部署完成，取得 Render 網域
  - [ ] 回 Google Console 補 Callback URL
  - [ ] 回 LINE Console 補 Callback URL

---

## 🟠 P1 — 重要（大幅提升作品集品質）

- [x] **首頁輪播圖 Banner（後台可控制）** ✅
  - Banner 資料表已加入（title、subtitle、image、link、order、isActive）
  - 後台管理頁：`app/admin/banners/page.tsx`（新增/編輯/上下架/刪除）
  - 首頁顯示輪播圖元件（自動輪播、左右箭頭、指示點）
  - API：`/api/admin/banners`、`/api/banners`
  - 已有 3 筆 Banner 測試資料

- [x] **活動/事件管理（後台可控制）** ✅
  - Event 資料表已加入（title、description、image、startDate、endDate、isActive）
  - 後台管理頁：`app/admin/events/page.tsx`
  - 前台顯示頁：`app/events/page.tsx`（活動列表，含進行中/已結束）
  - 首頁顯示「近期活動」區塊
  - 已有 4 筆活動測試資料（3 個未來活動 + 1 個已結束）

- [x] **Loading Skeleton 骨架畫面** ✅
  - 目的地卡片骨架：`components/DestinationCardSkeleton.tsx`
  - 列表頁骨架：`app/destinations/loading.tsx`
  - 全域 loading：`app/loading.tsx`

- [x] **手機版 Navbar（漢堡選單）** ✅
  - md 以下顯示漢堡圖示
  - 點開後右側拉選單（Drawer）
  - 包含所有導覽連結和登入狀態

---

## 🟡 P2 — 加分（細節決定品質）

- [x] **客製化 404 頁面** `app/not-found.tsx` ✅
  - 有設計感，引導回首頁

- [ ] **OG Image / Social 分享預覽**
  - 每個目的地頁有 og:image（用 Next.js ImageResponse 動態產生）
  - 分享到 LINE/Facebook 時顯示目的地圖片和名稱

- [ ] **圖片上傳（Cloudinary）**
  - 後台新增/編輯目的地時可以上傳圖片
  - 申請 Cloudinary 免費帳號
  - 替換目前的「填入圖片 URL」為真正的上傳功能

- [ ] **搜尋優化**
  - 搜尋結果即時預覽（dropdown）
  - 搜尋歷史記錄（localStorage）

- [ ] **個人資料編輯**
  - 可以修改名稱
  - 可以上傳頭像

- [ ] **Email 通知**
  - 評論審核通過後通知使用者（Resend 免費額度）
  - 使用 `app/api/send-email/route.ts`

- [ ] **後台數據圖表**
  - 儀表板加入折線圖（每月新增目的地數、評論數）
  - 使用 Recharts

---

## 🟢 P3 — 上線安全性（Render 部署後處理）

- [ ] **Rate Limiting（API 防暴力攻擊）**
  - 使用 Upstash Redis（有免費額度）
  - 限制登入 API：每 IP 每分鐘最多 5 次

- [ ] **CSRF 防護確認**（NextAuth.js 已內建）

- [ ] **環境變數安全稽核**
  - 確認沒有敏感資訊 commit 到 git
  - `.gitignore` 確認包含 `.env`

---

## 📋 目前後台功能清單

| 功能 | 狀態 |
|------|------|
| 儀表板（統計數字） | ✅ 已完成 |
| 目的地管理（列表/新增/編輯/刪除） | ✅ 已完成 |
| 分類管理（新增/刪除） | ✅ 已完成 |
| 評論審核（通過/駁回/刪除） | ✅ 已完成 |
| 輪播圖 Banner 管理 | ✅ 已完成 |
| 活動/事件管理 | ✅ 已完成 |
| 使用者管理 | ❌ 待建立 |

---

## 📋 OAuth 設定狀態

| 服務 | 開發環境 | 正式環境（Render） |
|------|---------|-----------------|
| Google 登入 | ❌ 未設定 | ❌ 未設定 |
| LINE 登入 | ❌ 未設定 | ❌ 未設定 |
| Email 登入 | ✅ 可用（帳號：admin@travel.com / password123） | - |

> 申請教學：`docs/OAUTH_SETUP.md`

---

## 🚀 Render 部署步驟

### 第一步：推上 GitHub
```bash
git init
git add .
git commit -m "feat: initial commit"
# 去 GitHub 建立新 repo，然後：
git remote add origin https://github.com/你的帳號/travel-explorer.git
git push -u origin main
```

### 第二步：Render 建立服務
1. 前往 https://render.com → 登入
2. New → Web Service → Connect GitHub repo
3. Build Command 會自動從 `render.yaml` 讀取

### 第三步：填入環境變數（Render Dashboard → Environment）

| 變數名稱 | 值 |
|---------|-----|
| `DATABASE_URL` | Neon 連線字串（同 .env） |
| `NEXTAUTH_SECRET` | 同 .env 的值 |
| `NEXTAUTH_URL` | `https://你的服務名.onrender.com` |
| `NEXT_PUBLIC_API_URL` | `https://你的服務名.onrender.com/api` |
| `GOOGLE_CLIENT_ID` | 同 .env |
| `GOOGLE_CLIENT_SECRET` | 同 .env |
| `LINE_CLIENT_ID` | 同 .env |
| `LINE_CLIENT_SECRET` | 同 .env |

### 第四步：部署完成後補 Callback URL

**Google Console** → OAuth 2.0 用戶端 → 已授權的重新導向 URI，新增：
```
https://你的服務名.onrender.com/api/auth/callback/google
```

**LINE Developers** → LINE Login Channel → Callback URL，新增：
```
https://你的服務名.onrender.com/api/auth/callback/line
```

> ⚠️ Render 免費方案：15 分鐘無人使用後服務會休眠，第一次請求需等 30~60 秒喚醒。這是正常現象。
