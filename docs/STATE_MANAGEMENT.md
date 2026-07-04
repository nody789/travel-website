# 狀態管理指南

本文件說明這個 Next.js 專案的狀態管理策略，
以及為什麼 Next.js 專案通常不需要 Redux。

---

## 這個專案的狀態來源

Next.js App Router 把資料來源分成三種：

```
1. Server Component 直接抓   → 不需要任何狀態管理
2. next-auth session         → 由框架管理，不需要手動處理
3. Client 端互動狀態          → useState 或 Zustand（視範圍而定）
```

---

## 三種狀態的選擇指南

### Server Component — 直接 async/await（最推薦）

```tsx
// app/destinations/page.tsx
// 這是 Server Component，直接在 server 端抓資料，不需要 useState、useEffect、useQuery
async function DestinationsPage() {
  // 直接 await，資料在 server 端就準備好了
  // 優點：SEO 友好、首次載入快、不需要 loading 狀態
  const destinations = await prisma.destination.findMany()

  return <DestinationList destinations={destinations} />
}
```

### next-auth — 認證狀態（框架自動處理）

```tsx
// Server Component 取得登入者
import { auth } from '@/auth'

async function ProfilePage() {
  const session = await auth()
  // session.user 就是目前登入的使用者
  // next-auth 自動管理 session，不需要 Redux 或 Zustand
}

// Client Component 取得登入者
'use client'
import { useSession } from 'next-auth/react'

function UserMenu() {
  const { data: session } = useSession()
  // session?.user 就是目前登入的使用者
}
```

### Client 端互動狀態

```
只有這個元件需要？      → useState
多個元件都需要（少見）  → Zustand
```

---

## 為什麼不用 Redux？

### 原因 1：Server Component 大幅減少 client 端狀態需求

傳統 React（無 Next.js）：
```
API 請求 → 回到 client → 存到全域 state → 傳給各元件
```

Next.js App Router：
```
Server Component 直接抓資料 → 傳給子元件（props）
```

大部分資料根本不需要到 client 端的全域狀態。

### 原因 2：next-auth 已經處理了最常見的全域狀態需求

「目前是誰登入」通常是最主要的全域狀態需求，
next-auth 的 `auth()` 和 `useSession()` 已經幫你管理好了。

### 原因 3：程式碼量差異

```
需求：在多個元件顯示登入者的名字

Redux：
  - 建立 store/index.ts
  - 建立 userSlice.ts（state + action + reducer）
  - main.tsx 加 <Provider>
  - 每個元件 useSelector + useDispatch
  - 共約 80~120 行樣板程式碼

next-auth：
  const session = await auth()    // Server Component，1 行
  const { data: session } = useSession()  // Client Component，1 行
```

---

## 對比：三個專案的狀態管理方式

| 專案 | 技術 | 認證 | 全域狀態 | 原因 |
|------|------|------|----------|------|
| airbnb-clone（Zustand 版）| React | 手動 JWT | Zustand | 輕量、語法簡潔 |
| airbnb-clone（Redux 版）| React | 手動 JWT | Redux Toolkit | 學習用，實務不需要 |
| travel-website | Next.js | next-auth | 幾乎不需要 | Server Component 直接抓資料 |

---

## 如果真的需要 Client 端全域狀態

使用 **Zustand**（不是 Redux）：

```bash
npm install zustand
```

```ts
// stores/uiStore.ts
import { create } from 'zustand'

interface UIStore {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))
```

```tsx
// 在 Client Component 使用
'use client'
import { useUIStore } from '@/stores/uiStore'

function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore()
  // ...
}
```

---

## 學習建議

如果你想學 Redux，建議去看 airbnb-clone 的 Redux 學習分支：
- 分支：`feat/redux-learning`
- 學習文件：`docs/REDUX_GUIDE.md`

那個分支把 Zustand 改寫成 Redux，並保留大量對比備註，
是學習 Redux 的最好方式（因為你已經熟悉 Zustand 的邏輯）。
