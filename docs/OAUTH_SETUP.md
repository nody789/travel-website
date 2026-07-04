# OAuth 憑證申請指南

這份文件說明如何申請 Google 和 LINE 的登入憑證，
並設定到 `.env.local`。**只需要做一次。**

---

## 前置作業：產生 NEXTAUTH_SECRET

在終端機執行：

```bash
openssl rand -base64 32
```

複製輸出的字串，填入 `.env.local`：

```
NEXTAUTH_SECRET=（貼上剛才產生的字串）
```

---

## Google 登入憑證

### Step 1 — 建立 Google Cloud 專案

1. 前往 https://console.cloud.google.com
2. 用你的 Google 帳號登入
3. 左上角點「**選取專案**」→「**新增專案**」
4. 專案名稱填 `travel-website`，點「**建立**」
5. 等建立完成，確認左上角已切換到這個專案

### Step 2 — 設定 OAuth 同意畫面

> 這是使用者點「用 Google 登入」時看到的授權畫面

1. 左側選單 →「**API 和服務**」→「**OAuth 同意畫面**」
2. 使用者類型選「**外部**」→「**建立**」
3. 填入：
   - 應用程式名稱：`Travel Explorer`
   - 使用者支援電子郵件：你的信箱
   - 開發人員聯絡資訊：你的信箱
4. 點「**儲存並繼續**」→ 之後的步驟都直接點「繼續」跳過 → 最後「**返回資訊主頁**」

### Step 3 — 建立 OAuth 憑證

1. 左側選單 →「**憑證**」
2. 上方點「**＋建立憑證**」→「**OAuth 用戶端 ID**」
3. 應用程式類型選「**網頁應用程式**」
4. 名稱填 `Travel Website`
5. 已授權的 **JavaScript 來源**，點「新增 URI」填入：
   ```
   http://localhost:3000
   ```
6. 已授權的**重新導向 URI**，點「新增 URI」填入：
   ```
   http://localhost:3000/api/auth/callback/google
   ```
7. 點「**建立**」

### Step 4 — 複製憑證

畫面會跳出視窗顯示：
- **用戶端 ID**（長這樣：`123456-xxx.apps.googleusercontent.com`）
- **用戶端密鑰**（長這樣：`GOCSPX-xxx`）

填入 `.env.local`：

```
GOOGLE_CLIENT_ID=（貼上用戶端 ID）
GOOGLE_CLIENT_SECRET=（貼上用戶端密鑰）
```

---

## LINE 登入憑證

### Step 1 — 登入 LINE Developers

1. 前往 https://developers.line.biz/console/
2. 點右上角「**Log in**」→ 用你的 LINE 帳號掃碼登入

### Step 2 — 建立 Provider

> Provider 是你的開發者帳號，可以放多個 channel（應用程式）

1. 點「**Create a new provider**」
2. Provider name 填 `Travel Explorer`（或你的名字）
3. 點「**Create**」

### Step 3 — 建立 LINE Login Channel

1. 在剛建立的 Provider 頁面，點「**Create a new channel**」
2. 選「**LINE Login**」
3. 填入：
   - Channel name：`Travel Explorer`
   - Channel description：`旅遊探索網站`
   - App types：勾選「**Web app**」
   - Email address：你的信箱
4. 勾選同意條款 → 點「**Create**」

### Step 4 — 設定 Callback URL

1. 進入剛建立的 channel
2. 點上方「**LINE Login**」分頁
3. 找到「Callback URL」→ 點「**Edit**」
4. 填入：
   ```
   http://localhost:3000/api/auth/callback/line
   ```
5. 點「**Update**」

### Step 5 — 複製憑證

1. 點「**Basic settings**」分頁
2. 找到：
   - **Channel ID**（純數字，例如：`1234567890`）
   - **Channel secret**（32 位英數字）

填入 `.env.local`：

```
LINE_CLIENT_ID=（貼上 Channel ID）
LINE_CLIENT_SECRET=（貼上 Channel secret）
```

---

## .env.local 完整範例

全部填完後長這樣：

```env
# 資料庫
DATABASE_URL="postgresql://user:password@localhost:5432/travel_db"

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Google
GOOGLE_CLIENT_ID=123456789-xxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxx

# LINE
LINE_CLIENT_ID=1234567890
LINE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 上線前還要做的事

正式部署到 Vercel 後，記得回來補正式網域的 URI。

### Google Cloud Console

「憑證」→「OAuth 用戶端 ID」→ 點你的憑證 → 補上：

- 已授權的 JavaScript 來源：
  ```
  https://your-domain.com
  ```
- 已授權的重新導向 URI：
  ```
  https://your-domain.com/api/auth/callback/google
  ```

### LINE Developers

「LINE Login」分頁 → Callback URL → 補上：

```
https://your-domain.com/api/auth/callback/line
```

### Vercel 環境變數

Vercel 後台 → 你的專案 → Settings → Environment Variables → 把 `.env.local` 的內容全部加進去，
並把 `NEXTAUTH_URL` 改成正式網址：

```
NEXTAUTH_URL=https://your-domain.com
```

---

## 常見問題

**Q：Google 登入出現「此應用程式未經驗證」警告？**

開發測試時是正常的，點「進階」→「前往（不安全）」即可。
正式上線前要到 Google Cloud Console 申請「驗證」，審核約 1-2 週。

**Q：LINE 登入後名字是 null？**

LINE 預設不回傳 email，名字有時也是 null。
要在 LINE Login channel 的「Scopes」裡勾選 `profile` 和 `openid`。

**Q：憑證可以免費用嗎？**

可以。Google OAuth 和 LINE Login 都是免費的，沒有使用量限制。
