# PROJECT.md

## 專案名稱

旅遊探索網站（Travel Explorer）

## 專案描述

提供旅遊目的地瀏覽、搜尋、收藏、評論的旅遊資訊網站。
管理員可透過後台新增與管理目的地內容；會員可收藏景點、撰寫評論評分、查看個人資料頁。

## 專案目標

解決問題：使用者想找旅遊靈感，但資訊分散，難以統整收藏與參考他人評價。
目標族群：喜歡旅遊、規劃行程的使用者。

## 技術棧

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 14（App Router） |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS + shadcn/ui |
| 認證 | NextAuth.js（Google / GitHub / Email+密碼） |
| 資料驗證 | Zod |
| HTTP 請求 | axios |
| 資料庫 | PostgreSQL + Prisma ORM |
| 部署 | Vercel + Vercel Postgres（或 Supabase） |

## 角色設計

| 角色 | 說明 |
|------|------|
| 訪客 | 可瀏覽目的地、看評論，不能收藏或留言 |
| USER（一般會員） | 登入後可收藏景點、撰寫評論評分、查看個人資料頁 |
| ADMIN（管理員） | 存取 `/admin/*` 後台，管理目的地、分類、評論 |

## 目錄結構

```
travel-website/
├── app/                              ← Next.js App Router 核心
│   ├── layout.tsx                    ← 全站共用外框（Navbar、Footer）
│   ├── page.tsx                      ← 首頁 /
│   │
│   ├── destinations/                 ← 前台：目的地
│   │   ├── page.tsx                  ← 目的地列表 /destinations
│   │   └── [id]/
│   │       └── page.tsx              ← 目的地詳情 /destinations/[id]
│   │
│   ├── favorites/
│   │   └── page.tsx                  ← 收藏清單 /favorites（需登入）
│   │
│   ├── profile/
│   │   └── page.tsx                  ← 個人資料頁 /profile（需登入）
│   │
│   ├── auth/                         ← NextAuth.js 登入相關頁面
│   │   ├── signin/page.tsx           ← 登入頁
│   │   └── error/page.tsx            ← 認證錯誤頁
│   │
│   ├── admin/                        ← 後台（只有 ADMIN 可進入）
│   │   ├── layout.tsx                ← 後台共用版型（側邊選單）
│   │   ├── page.tsx                  ← 後台儀表板 /admin
│   │   ├── destinations/
│   │   │   ├── page.tsx              ← 目的地管理列表
│   │   │   ├── new/page.tsx          ← 新增目的地
│   │   │   └── [id]/edit/page.tsx    ← 編輯目的地
│   │   ├── categories/
│   │   │   └── page.tsx              ← 分類管理
│   │   └── reviews/
│   │       └── page.tsx              ← 評論管理（審核）
│   │
│   └── api/                          ← API Routes（後端）
│       ├── auth/[...nextauth]/route.ts  ← NextAuth.js 必要路由
│       ├── destinations/
│       │   ├── route.ts              ← GET /api/destinations
│       │   └── [id]/
│       │       ├── route.ts          ← GET /api/destinations/:id
│       │       └── reviews/route.ts  ← GET/POST /api/destinations/:id/reviews
│       ├── categories/route.ts
│       ├── favorites/
│       │   ├── route.ts              ← GET/POST /api/favorites
│       │   └── [id]/route.ts         ← DELETE /api/favorites/:id
│       ├── reviews/
│       │   └── [id]/route.ts         ← PATCH/DELETE /api/reviews/:id
│       └── admin/                    ← 後台 API（驗證 ADMIN 角色）
│           ├── destinations/route.ts
│           ├── destinations/[id]/route.ts
│           └── reviews/[id]/route.ts
│
├── components/
│   ├── ui/                           ← shadcn/ui 元件（自動生成）
│   ├── DestinationCard.tsx
│   ├── SearchBar.tsx
│   ├── CategoryFilter.tsx
│   ├── ReviewCard.tsx
│   ├── StarRating.tsx
│   ├── FavoriteButton.tsx            ← 客戶端元件（有互動）
│   └── Navbar.tsx
│
├── lib/
│   ├── prisma.ts                     ← Prisma 連線（singleton）
│   ├── auth.ts                       ← NextAuth.js 設定
│   └── utils.ts
│
├── types/
│   └── index.ts                      ← 所有 TypeScript 型別定義
│
├── hooks/
│   └── useFavorites.ts
│
├── middleware.ts                     ← 保護路由（/favorites、/profile、/admin）
│
├── prisma/
│   └── schema.prisma
│
├── .env.local                        ← 環境變數（不要 commit）
├── .env.example
└── next.config.ts
```

## 開發環境設置

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數
cp .env.example .env.local
# 填入 DATABASE_URL、NEXTAUTH_SECRET、Google/GitHub OAuth 設定

# 3. 啟動資料庫（需要 Docker）
docker compose up -d

# 4. 建立資料表
npx prisma migrate dev

# 5. 啟動開發伺服器
npm run dev
```

## 環境變數

```env
# 資料庫
DATABASE_URL="postgresql://user:password@localhost:5432/travel_db"

# NextAuth.js（必填）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # 用 openssl rand -base64 32 產生

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# 前端可讀的環境變數（加 NEXT_PUBLIC_ 前綴）
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 路由保護策略

透過 `middleware.ts` 攔截請求：

```
/favorites  → 需要登入（USER 或 ADMIN）
/profile    → 需要登入
/admin/*    → 需要 ADMIN 角色，否則導向 403
```

## 注意事項

- Next.js App Router 的頁面預設是 Server Component，需要互動才加 `'use client'`
- NextAuth.js session 在 Server Component 用 `getServerSession()`，Client Component 用 `useSession()`
- 後台 API（`/api/admin/*`）每個端點都要驗證 `session.user.role === 'ADMIN'`
- 圖片上傳建議使用 Vercel Blob 或 Cloudinary，不要存到本地
