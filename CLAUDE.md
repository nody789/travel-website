# CLAUDE.md

# 專案 AI 助理設定檔

## 開發者背景

中階前端工程師，熟悉 React / Vue / Tailwind CSS。
**第一次使用 Next.js 和 TypeScript**，正在學習中。

主要技術：

* React
* Vue
* Tailwind CSS
* TypeScript（學習中）

正在學習：

* Next.js（App Router）
* TypeScript 型別設計
* Node.js / RESTful API
* Prisma ORM

請在協助開發時：

* 提供可維護的程式碼
* 加入適當中文備註，說明 Next.js 和 TypeScript 的重要概念
* 解釋「為什麼這樣寫」，不只是給程式碼
* 說明 Next.js 和傳統 React 的差異（遇到時主動說明）
* 避免過度複雜的架構

---

# 程式碼規範

## TypeScript

規則：

* 避免使用 `any`，這樣就和沒用 TypeScript 一樣了
* 優先使用 `interface` 定義物件型別
* 型別需明確定義，不要依賴 TypeScript 自動推導（學習初期先寫清楚）

備註：

如果有更好的型別設計方式，
請說明原因並提供範例。
遇到泛型（Generics）時，請加上說明。

---

## Next.js App Router

規則：

* 頁面元件放在 `app/` 目錄，使用資料夾作為路由
* 預設為 Server Component（伺服器元件），不能用 `useState`、`useEffect`
* 需要互動的元件加上 `'use client'`，變成 Client Component
* 動態路由資料夾命名用 `[id]`，例如 `app/destinations/[id]/page.tsx`
* API 路由放在 `app/api/` 下，每個 `route.ts` 對應一個端點

備註：

遇到 Server Component vs Client Component 的判斷時，請說明理由。

---

## React

規則：

* 使用 Functional Component
* 使用 Hooks
* Component 需可重用
* 避免過度拆分元件

備註：

若有更好的結構，請說明為什麼要這樣調整。

---

## React / Next.js 備註規範（學習模式）

這是第一次使用 Next.js 的學習型專案，程式碼請加入中文備註：

* **每個 Component 檔案頂部**：說明元件職責、是 Server 還是 Client Component
* **`'use client'` 指令**：說明為什麼這個元件需要變成 Client Component
* **Server Component 的資料取得**：說明在 server 端取得資料的好處（SEO、效能）
* **`useState` / `useEffect`**：說明 state 存什麼、effect 的觸發時機（只在 Client Component 可用）
* **`useCallback` / `useMemo`**：說明為什麼需要快取，避免什麼問題
* **Props / TypeScript interface**：說明每個欄位的用途與型別含義
* **Next.js `<Image>`**：說明為什麼不用原生 `<img>`（自動最佳化、lazy loading）
* **Next.js `<Link>`**：說明為什麼不用原生 `<a>`（SPA 導頁、prefetch）
* **動態路由 `[id]`**：說明這個參數從哪裡來、如何取得
* **條件渲染**：說明判斷條件背後的商業邏輯

備註：

不要每一行都加，只在「不看備註就不容易理解」的地方加。
特別注意：遇到 Next.js 和傳統 React 不一樣的地方，一定要說明差異。

---

## React 核心概念說明（學習重點）

遇到以下概念時，請加入說明讓開發者理解原理：

### Re-render 觸發時機

React 元件在以下情況重新渲染：
1. **自己的 state 改變**（`setState` 被呼叫）
2. **父元件重新渲染**（即使 props 沒變，子元件也跟著渲染）
3. **傳入的 props 改變**

注意：**Server Component 不會 re-render**（只在 server 執行一次）。
只有 Client Component（加了 `'use client'`）才有 re-render 的概念。

遇到效能問題時，請說明是哪種 re-render 觸發，以及如何用 `useMemo` / `useCallback` / `React.memo` 解決。

### useEffect dependency array（最常見 bug 來源）

```js
useEffect(() => { ... })          // 每次渲染都跑 ← 通常是 bug
useEffect(() => { ... }, [])      // 只在第一次掛載跑
useEffect(() => { ... }, [id])    // id 改變時才跑
```

遇到 `useEffect` 時，請說明觸發時機與目的。
**本專案優先用 Server Component `async/await` 抓資料，不用 useEffect。**

### Key prop（list 渲染必知）

```jsx
// 錯誤：用 index 當 key，增刪時 React 無法正確追蹤
{items.map((item, index) => <Card key={index} />)}

// 正確：用資料的唯一 id
{items.map((item) => <Card key={item.id} />)}
```

每次產生 list 渲染時，請說明為什麼 key 要用 id 而不是 index。

---

## 認證機制（next-auth）

本專案使用 **next-auth v5（Auth.js）** 處理登入，與 airbnb-clone 的 JWT 方式完全不同。

### next-auth vs 手動 JWT 的差異

| | next-auth | 手動 JWT（airbnb-clone） |
|---|---|---|
| token 存放 | httpOnly Cookie（自動處理，安全）| localStorage（需自己管理，有 XSS 風險）|
| 登入流程 | 框架處理，幾行設定搞定 | 自己寫 `/auth/login` 路由 |
| Session 取得 | `auth()` 或 `useSession()` | 從 localStorage 讀 token，自己解碼 |
| OAuth（Google 登入） | 內建支援 | 需自己實作 |

### 常用 API

```ts
// Server Component：取得目前登入者
import { auth } from '@/auth'
const session = await auth()
const user = session?.user

// Client Component：取得目前登入者
import { useSession } from 'next-auth/react'
const { data: session } = useSession()

// 登入 / 登出
import { signIn, signOut } from 'next-auth/react'
```

每次使用 next-auth 時，請說明：
* 這裡是在 Server 還是 Client Component 取得 session
* 為什麼用 `auth()` 或 `useSession()`（兩者使用情境不同）
* 需要登入才能存取的頁面，如何保護（middleware）

---

## 表單處理（Controlled Component）

Next.js App Router 支援 **Server Actions**（在 server 直接處理表單），或傳統 Client Component 表單。

### 傳統 Controlled Component（Client Component）

```tsx
'use client'
const [email, setEmail] = useState('')

<input
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Server Actions（Next.js 特有，推薦用於表單送出）

```tsx
// 不需要 'use client'，直接在 server 執行
async function handleSubmit(formData: FormData) {
  'use server'
  const email = formData.get('email')
  // 直接操作資料庫，不需要 API 路由
}
```

遇到表單時，請說明：
* 使用 Controlled Component 還是 Server Actions，以及原因
* 驗證邏輯在哪裡做（Zod）
* 錯誤訊息如何顯示

---

## 全域狀態管理

Next.js 使用 Server Component 後，很多資料直接在 server 端抓取，**不需要放進全域 state**。

### useState / useEffect / useQuery / Zustand 的關聯與選擇

這四個工具各管不同類型的狀態，不是競爭關係：

| 工具 | 管什麼 | 使用時機 |
|------|--------|----------|
| `useState` | 元件內部的本地狀態 | 只有這個元件自己需要的資料（輸入框值、toggle 開關） |
| `useEffect` | 元件掛載/更新後的副作用 | 監聽事件、計時器、DOM 操作（不要用來抓 API） |
| `useQuery` | 來自伺服器的資料（Client Component） | API 請求，自動處理 loading / error / cache |
| `Zustand` | 多元件共享的全域狀態 | 登入使用者、跨頁需要保留的資料 |

**Next.js 特有情況：**
```
資料要 SEO / 首次渲染就有？
  → Server Component 直接 async/await 抓（不需要 useQuery）
資料需要互動後才抓？
  → Client Component + useQuery
多個 Client Component 都需要的資料？
  → Zustand
```

**本專案實際例子：**
- 目的地列表（首頁） → Server Component `async/await`（SEO 友好）
- 搜尋結果（動態篩選） → `useQuery`（互動後才抓）
- 已登入的使用者 → `Zustand`（所有頁面都需要）
- Modal 開關 → `useState`（只有這個元件需要）

### Zustand 備註規範

Zustand store 程式碼請加入中文備註：

* **store 頂部**：說明這個 store 負責管理哪些全域狀態
* **每個 state 欄位**：說明存什麼資料、初始值為何
* **每個 action（函式）**：說明觸發時機、做什麼事、會影響哪些 state
* **從元件使用 store 時**：說明「為什麼這個資料要放全域而不是 useState」

### 什麼資料才放全域 state？

* 登入使用者資訊（client 端多個元件都需要）
* UI 狀態（如：側邊欄開關、Modal 顯示）
* 跨頁面需要保留的篩選條件

### 狀態管理選擇

若需要全域狀態，使用 **Zustand**（語法簡潔，適合中小型專案）。

本專案不使用 Redux，原因：
* Next.js 的 Server Component 已大幅減少 client 端全域狀態的需求
* Zustand 程式碼量少，不需要 action / reducer / store 分開寫
* Redux 適合超大型多人團隊，本專案規模不需要

### Zustand vs Redux 快速比較

| | Zustand | Redux |
|---|---|---|
| 程式碼量 | 少，直接定義 state + action | 多，樣板程式碼很多 |
| 適合規模 | 小～中型 | 大型、多人團隊 |
| 學習曲線 | 低 | 高 |

---

## Tailwind CSS

規則：

* 優先使用 Tailwind
* 避免大量 inline style
* 優先考慮 RWD（mobile-first）
* 使用 `cn()` 工具函式組合 class（shadcn/ui 內建）

---

# API 規範

成功格式：

```json
{
  "success": true,
  "data": {}
}
```

失敗格式：

```json
{
  "success": false,
  "message": "錯誤描述"
}
```

---

# 安全性規則

* 密碼、API Key 一律寫在環境變數，禁止寫在程式碼裡
* 環境變數加 `NEXT_PUBLIC_` 前綴才能在瀏覽器端讀取，其他的只有 server 端能讀
* 所有使用者輸入必須驗證，使用 Zod 處理
* 資料庫操作透過 Prisma（禁止字串拼接查詢）
* API 需要登入的端點必須驗證 session

---

# 慣用套件

| 用途 | 套件 |
|------|------|
| 資料庫 ORM | Prisma |
| 資料驗證 | Zod |
| 日期處理 | day.js |
| 前端 HTTP 請求 | axios |
| UI 元件 | shadcn/ui |
| 測試 | Vitest |

---

# Git 規則

## Branch 命名

```
feat/功能名稱       新功能
fix/問題名稱        Bug 修復
chore/雜項名稱      套件更新、設定調整
refactor/名稱       重構，不影響功能
```

## Commit 格式

```
feat: 新增目的地列表頁
fix: 修復收藏按鈕重複點擊問題
chore: 更新 Prisma 至 5.x
refactor: 拆分 DestinationCard 元件
```

---

# 教學模式

因為是第一次使用 Next.js 和 TypeScript，
遇到以下情況請加上說明：

* Next.js App Router 的特有概念（Server Component、Client Component、Route Handlers）
* TypeScript 型別定義（尤其是泛型、聯合型別、工具型別）
* Prisma 資料庫操作
* Next.js 的 `<Image>`、`<Link>` 和原生 HTML 的差異

請額外提供：

【為什麼要這樣寫】

【Next.js 和傳統 React 的差異】（如有）

【常見錯誤或注意事項】

---

# 開始開發前

**每次開發新功能，請先執行以下步驟：**

1. 閱讀 `docs/PROJECT.md` — 了解專案目標與技術棧
2. 閱讀 `docs/API.md` — 了解 API 規格與端點
3. 閱讀 `docs/DATABASE.md` — 了解資料結構與關聯
4. 閱讀 `docs/UI_RULES.md` — 了解 UI 設計規範
5. 摘要你理解的內容，確認後再開始開發

---

# 備註

專案特殊規則請寫於：

* `docs/PROJECT.md`
* `docs/API.md`
* `docs/DATABASE.md`
* `docs/UI_RULES.md`
* `docs/CHANGELOG.md`
