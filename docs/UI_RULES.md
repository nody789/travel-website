# UI_RULES.md

## 設計系統

使用 **shadcn/ui** + **Tailwind CSS**

```bash
# 安裝 shadcn/ui 需要的元件
npx shadcn@latest add button card input badge
npx shadcn@latest add table dialog form label
npx shadcn@latest add dropdown-menu avatar separator toast
```

---

## 色彩規範

旅遊網站配色：「天空藍 + 珊瑚橙」，清爽、有探索感。

```css
/* 主色：天空藍（Navbar、主要按鈕、連結） */
primary: sky-600          /* #0284c7 */
primary-hover: sky-700

/* 輔色：珊瑚橙（收藏、標籤、強調） */
accent: orange-500        /* #f97316 */

/* 中性色 */
background: gray-50
surface: white            /* 卡片背景 */
text-primary: gray-900
text-secondary: gray-500

/* 狀態色 */
success: green-500
warning: yellow-500
error: red-500
info: blue-500
```

---

## 字體規範

```
主標題 (H1)：font-bold text-4xl
副標題 (H2)：font-bold text-2xl
區塊標題 (H3)：font-semibold text-xl
卡片標題：font-semibold text-lg
內文：text-base text-gray-700
輔助文字：text-sm text-gray-500
```

---

## RWD 斷點

| 名稱 | 寬度 | 說明 |
|------|------|------|
| sm | 640px | 手機橫向 |
| md | 768px | 平板 |
| lg | 1024px | 筆電 |
| xl | 1280px | 桌機 |

**Mobile-first 原則**：先寫手機版樣式，再用 `md:` `lg:` 覆蓋大螢幕。

---

## 前台元件規範

### 目的地卡片（DestinationCard）

```
┌────────────────────────┐
│   封面圖 (16:9)         │  ← 右上角：❤️ 收藏按鈕
├────────────────────────┤
│ 🏛️ 歷史古蹟             │  ← Badge（分類）
│ 九份老街               │  ← font-semibold text-lg
│ 📍 台灣・新北市         │  ← text-sm text-gray-500
│ ⭐ 4.5  (32 則評論)     │
└────────────────────────┘
```

格網排版（RWD）：
- 手機：1 欄 `grid-cols-1`
- 平板：2 欄 `md:grid-cols-2`
- 桌機：3 欄 `lg:grid-cols-3`

### 評分星星（StarRating）

```tsx
{/* 唯讀：顯示評分 */}
<StarRating value={4.5} readonly />

{/* 可互動：讓使用者選擇 */}
<StarRating value={rating} onChange={setRating} />
```

- 5 顆星，支援半星顯示
- 互動版：hover 時亮起，點擊後選定

### 評論卡片（ReviewCard）

```
┌──────────────────────────────┐
│ 👤 使用者名稱    2024-01-15   │
│ ⭐⭐⭐⭐⭐                    │
│ 景色非常美！強烈推薦夜間前往。 │
└──────────────────────────────┘
```

### 按鈕

```tsx
{/* 主要按鈕 */}
<Button className="bg-sky-600 hover:bg-sky-700">立即探索</Button>

{/* 次要按鈕 */}
<Button variant="outline">查看更多</Button>

{/* 收藏按鈕（切換狀態） */}
<Button variant="ghost" size="icon" className={isFavorited ? "text-orange-500" : "text-gray-400"}>
  <Heart className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
</Button>

{/* 危險操作 */}
<Button variant="destructive">刪除</Button>
```

### 搜尋列

```
[ 🔍 搜尋目的地...                        ]
```

- 搜尋時 debounce 300ms（避免每個字都打 API）
- 手機：全寬；桌機：最大 480px

### 分類篩選

水平捲動，手機可左右滑：
```
[全部] [🏖️ 海灘] [🏛️ 古蹟] [🌿 自然] [🍜 美食]
```

選中的分類 badge 用 sky-600 底色標示。

### 導覽列（Navbar）

```
[ 🌏 Travel Explorer ]    [ 首頁  目的地  收藏 ]  [ 使用者頭像 ▾ ]
                                                     └ 個人資料
                                                     └ 登出
```

- `sticky top-0 z-50`，固定在頂部
- 未登入：顯示「登入」按鈕
- 已登入：顯示使用者頭像（Avatar），點擊展開 Dropdown

---

## 後台元件規範

後台使用較簡潔的管理界面，以功能為主。

### 後台側邊選單

```
┌─────────────────┐
│ ⚙️ 管理後台      │
├─────────────────┤
│ 📊 儀表板        │
│ 🗺️ 目的地管理    │
│ 🏷️ 分類管理      │
│ 💬 評論審核      │
└─────────────────┘
```

### 後台表格

使用 shadcn/ui `<Table>` 元件，每列右側有操作欄：

```
| 名稱     | 分類     | 狀態   | 操作        |
|---------|---------|--------|------------|
| 九份老街 | 歷史古蹟 | ✅上架  | [編輯] [刪除] |
| 太魯閣  | 自然景觀 | ⬜草稿  | [編輯] [刪除] |
```

### 目的地新增/編輯表單

```
名稱：[________________________]
Slug：[________________________]  ← URL 友善名稱，自動從名稱產生
分類：[下拉選單 ▾]
地點：[________________________]
描述：[________________________]
      [________________________]  ← Textarea
封面圖：[拖拽上傳 或 填入 URL]
是否上架：○ 是  ● 否
```

---

## 動畫與過渡

- 按鈕 hover：`transition-colors duration-200`
- 卡片 hover：`hover:shadow-lg transition-shadow duration-200`
- 卡片圖片 hover：`group-hover:scale-105 transition-transform duration-300`（用 `group` 配合）
- Toast 通知：shadcn/ui 內建

---

## 圖片處理

使用 Next.js `<Image>`，不用原生 `<img>`：

```tsx
import Image from 'next/image'

<Image
  src={destination.coverImage}
  alt={destination.name}
  width={400}
  height={225}
  className="rounded-t-lg object-cover w-full"
/>
```

外部圖片網域需在 `next.config.ts` 設定：

```typescript
// next.config.ts
const config = {
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'res.cloudinary.com' }
    ]
  }
}
```

---

## 備註

- 連結一律用 Next.js `<Link>`，不用原生 `<a>`
- 圖片一律用 Next.js `<Image>`，不用原生 `<img>`
- 成功/失敗通知使用 shadcn/ui Toast
- 刪除操作需要確認 Dialog（`你確定要刪除嗎？`）
- 後台頁面 sidebar 固定，主內容區域 overflow-y-auto
