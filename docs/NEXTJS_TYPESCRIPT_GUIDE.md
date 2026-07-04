# Next.js + TypeScript 學習指南

這份文件是針對已熟悉 React / Vue 的前端工程師，
快速理解 Next.js 和 TypeScript 的核心概念。

---

## 一、TypeScript 基礎

你已經會 React，TypeScript 只是在 JavaScript 上加了「型別」，
讓程式碼更安全、讓 IDE 可以自動提示。

### 1-1 基本型別寫法

```typescript
// JavaScript 寫法
const name = '九份老街'
const rating = 4.5
const isOpen = true

// TypeScript 寫法（加上型別標注）
const name: string = '九份老街'
const rating: number = 4.5
const isOpen: boolean = true

// 陣列
const tags: string[] = ['古蹟', '老街', '夜景']
const scores: number[] = [4.5, 3.8, 5.0]
```

### 1-2 interface — 定義物件的形狀

interface 就像是「規格書」，告訴 TypeScript 這個物件要有哪些欄位、是什麼型別。

```typescript
// 定義一個目的地的型別
interface Destination {
  id: string
  name: string
  location: string
  rating: number
  coverImage: string
  category: Category        // 可以巢狀其他 interface
  description?: string      // 加 ? 代表這個欄位是可選的（可以不填）
}

interface Category {
  id: string
  name: string
  icon: string
}

// 使用的時候
const place: Destination = {
  id: 'cl123',
  name: '九份老街',
  location: '台灣・新北市',
  rating: 4.5,
  coverImage: 'https://...',
  category: { id: 'cl456', name: '歷史古蹟', icon: '🏛️' }
  // description 可以不填，因為是 optional
}
```

### 1-3 函式的型別

```typescript
// 參數和回傳值都要標型別
function formatRating(rating: number): string {
  return rating.toFixed(1)  // "4.5"
}

// 箭頭函式
const formatRating = (rating: number): string => rating.toFixed(1)

// 沒有回傳值用 void
function logMessage(message: string): void {
  console.log(message)
}
```

### 1-4 React 元件的型別

```typescript
// 定義 props 的型別
interface DestinationCardProps {
  destination: Destination
  onFavorite: (id: string) => void  // 函式型別：接收一個 string，沒有回傳值
  isFavorited?: boolean             // 可選 prop
}

// 套用到元件
// React.FC 就是 React Function Component 的縮寫
const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onFavorite,
  isFavorited = false  // 給預設值
}) => {
  return (
    <div>
      <h2>{destination.name}</h2>
    </div>
  )
}
```

### 1-5 常見工具型別

```typescript
// Partial<T> — 把所有欄位變成可選（常用於「更新資料」的情境）
interface UpdateDestinationInput extends Partial<Destination> {}
// 等同於：{ id?: string, name?: string, rating?: number, ... }

// Pick<T, Keys> — 只取部分欄位
type DestinationSummary = Pick<Destination, 'id' | 'name' | 'coverImage'>
// 只有三個欄位：{ id, name, coverImage }

// 聯合型別（Union Type）
type Status = 'loading' | 'success' | 'error'
// 這個變數只能是這三個字串之一
let currentStatus: Status = 'loading'
```

---

## 二、Next.js App Router 核心概念

Next.js 14 使用「App Router」，和舊版的 Pages Router 不同。
你可能在網路上看到的舊教學是用 `pages/` 目錄，這個專案用的是 `app/` 目錄。

### 2-1 資料夾 = 路由

```
app/
├── page.tsx              →  /               （首頁）
├── destinations/
│   ├── page.tsx          →  /destinations   （目的地列表）
│   └── [id]/
│       └── page.tsx      →  /destinations/123  （目的地詳情，id 是動態的）
└── favorites/
    └── page.tsx          →  /favorites
```

不需要設定 React Router，資料夾結構就是路由！

### 2-2 Server Component vs Client Component

這是 Next.js 最重要也最容易搞混的概念。

| 類型 | 說明 | 可以用 useState/useEffect？ | 可以直接查資料庫？ |
|------|------|---------------------------|-------------------|
| Server Component | 預設值，在伺服器執行 | ❌ 不行 | ✅ 可以 |
| Client Component | 加 `'use client'`，在瀏覽器執行 | ✅ 可以 | ❌ 不行 |

**判斷方式：這個元件需要互動嗎？**

```typescript
// ✅ Server Component — 不需要互動，只是顯示資料
// 不用加 'use client'，直接查資料庫
async function DestinationDetailPage({ params }: { params: { id: string } }) {
  // 可以直接用 Prisma 查資料庫（在伺服器上執行）
  const destination = await prisma.destination.findUnique({
    where: { id: params.id }
  })

  return <div>{destination?.name}</div>
}

// ✅ Client Component — 需要互動（按鈕、狀態管理）
'use client'  // ← 這行必須在檔案最上方

import { useState } from 'react'

function FavoriteButton({ destinationId }: { destinationId: string }) {
  const [isFavorited, setIsFavorited] = useState(false)

  return (
    <button onClick={() => setIsFavorited(!isFavorited)}>
      {isFavorited ? '❤️' : '🤍'}
    </button>
  )
}
```

**常見錯誤：**
```
Error: useState can only be used in Client Components.
Add the "use client" directive at the top of the file.
```
遇到這個錯誤，就在檔案第一行加上 `'use client'`。

### 2-3 layout.tsx — 共用外框

```typescript
// app/layout.tsx
// 這個 layout 包住所有頁面，是放 Navbar、Footer 的地方

export default function RootLayout({
  children  // children 就是各個頁面的內容
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### 2-4 動態路由取得參數

```typescript
// app/destinations/[id]/page.tsx

// params 會自動包含 URL 的動態部分
// 例如 /destinations/cl123 → params.id = 'cl123'
export default async function DestinationPage({
  params,
  searchParams  // URL 的 query string，例如 ?tab=photos
}: {
  params: { id: string }
  searchParams: { tab?: string }
}) {
  return <div>目的地 ID：{params.id}</div>
}
```

### 2-5 API Routes（route.ts）

Next.js 不需要另外跑 Express，API 就寫在同一個專案裡。

```typescript
// app/api/destinations/route.ts

import { NextRequest, NextResponse } from 'next/server'

// GET /api/destinations
export async function GET(request: NextRequest) {
  // 取得 query string
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')  // 可能是 null

  // 查資料庫...
  const destinations = await prisma.destination.findMany()

  // 回傳 JSON
  return NextResponse.json({
    success: true,
    data: { items: destinations }
  })
}

// POST /api/destinations
export async function POST(request: NextRequest) {
  const body = await request.json()  // 取得 request body
  // 驗證、儲存...
  return NextResponse.json({ success: true, data: {} }, { status: 201 })
}

// DELETE /api/destinations/[id]
// 檔案位置：app/api/destinations/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // params.id 就是 URL 的 [id]
  return NextResponse.json({ success: true, data: null })
}
```

### 2-6 Next.js 內建元件

這些是 Next.js 提供的特殊元件，比原生 HTML 更好：

```typescript
// ✅ 使用 Next.js 的 Link，不要用 <a>
// Link 只更新頁面需要改變的部分，不會整頁重新載入（更快）
import Link from 'next/link'
<Link href="/destinations">目的地</Link>

// ✅ 使用 Next.js 的 Image，不要用 <img>
// 自動優化圖片、lazy loading、避免版面跳動
import Image from 'next/image'
<Image src="..." alt="..." width={400} height={225} />

// ✅ useRouter — 在 Client Component 中導頁
'use client'
import { useRouter } from 'next/navigation'  // 注意是 next/navigation，不是 next/router
const router = useRouter()
router.push('/destinations')
```

---

## 三、開發這個專案的建議步驟

### Step 1：初始化 Next.js 專案

```bash
npx create-next-app@latest travel-website \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=no \
  --import-alias="@/*"
```

選項說明：
- `--typescript`：使用 TypeScript
- `--tailwind`：安裝 Tailwind CSS
- `--app`：使用 App Router（新版，選這個）
- `--import-alias="@/*"`：讓你可以用 `@/components/...` 取代 `../../components/...`

### Step 2：安裝 shadcn/ui

```bash
npx shadcn@latest init
```

之後需要什麼元件再安裝：
```bash
npx shadcn@latest add button card input badge
```

### Step 3：安裝其他套件

```bash
npm install prisma @prisma/client
npm install axios
npm install zod
npm install dayjs
npx prisma init  # 建立 prisma/schema.prisma
```

### Step 4：建議的開發順序

1. 先建立 TypeScript 型別（`types/index.ts`）
2. 建立資料庫 Schema（`prisma/schema.prisma`）
3. 建立 API Routes
4. 建立頁面元件
5. 串接 API

---

## 四、常見問題 Q&A

**Q：什麼時候加 `'use client'`，什麼時候不加？**

需要以下任一項就加：
- `useState`、`useReducer`（狀態管理）
- `useEffect`（副作用）
- DOM 事件：`onClick`、`onChange`、`onSubmit`
- 瀏覽器 API：`window`、`localStorage`

只是顯示資料、不需要互動的就不用加（讓它保持 Server Component，效能更好）。

---

**Q：為什麼 Next.js 的頁面函式要加 `async`？**

因為 Server Component 可以直接在函式裡 `await` 查資料庫，
不需要像傳統 React 用 `useEffect` + `useState` 來抓資料。

```typescript
// 傳統 React 的做法
function DestinationList() {
  const [destinations, setDestinations] = useState([])
  useEffect(() => {
    axios.get('/api/destinations').then(res => setDestinations(res.data))
  }, [])
  return <div>{/* ... */}</div>
}

// Next.js Server Component 的做法（更簡潔）
async function DestinationList() {
  const destinations = await prisma.destination.findMany()
  return <div>{/* ... */}</div>
}
```

---

**Q：`interface` 和 `type` 有什麼差別，用哪個？**

這個專案統一用 `interface`，原則如下：
- 定義物件形狀 → 用 `interface`
- 定義聯合型別（`'loading' | 'success'`）→ 用 `type`

兩者在大多數情況下可以互換，初期不用太糾結。

---

**Q：看到 `<T>` 這種尖括號是什麼？**

那是「泛型（Generics）」，讓函式或 interface 可以接受不同型別。

```typescript
// 這個 ApiResponse 可以包裝任何型別的 data
interface ApiResponse<T> {
  success: boolean
  data: T
}

// 使用時指定 T 是什麼
const res: ApiResponse<Destination[]> = {
  success: true,
  data: [{ id: '1', name: '九份', ... }]
}

// 或是
const res: ApiResponse<{ total: number }> = {
  success: true,
  data: { total: 100 }
}
```

遇到泛型不懂，先照著用，之後再深入學。

---

## 五、延伸學習資源

| 主題 | 推薦資源 |
|------|----------|
| Next.js 官方文件 | https://nextjs.org/docs |
| TypeScript 手冊 | https://www.typescriptlang.org/docs/handbook/intro.html |
| Prisma 文件 | https://www.prisma.io/docs |
| shadcn/ui | https://ui.shadcn.com |
| Tailwind CSS | https://tailwindcss.com/docs |

**學習建議：**
1. 先把這個專案做出來，遇到問題再查
2. 看錯誤訊息，TypeScript 的錯誤訊息雖然長，但很精確
3. 不懂的型別問 Claude，貼上錯誤讓它解釋
