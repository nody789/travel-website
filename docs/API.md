# API.md

## Base URL

```
開發環境：http://localhost:3000/api
正式環境：https://your-domain.vercel.app/api
```

## 認證方式

使用 **NextAuth.js** Session Cookie（自動處理，不需要手動帶 Authorization header）。

```
前端呼叫 API 時，瀏覽器自動帶上 session cookie。
需要登入的 API 端點會在 server 端驗證 session。
```

## 統一回應格式

成功：

```json
{
  "success": true,
  "data": {}
}
```

失敗：

```json
{
  "success": false,
  "message": "錯誤描述"
}
```

---

## API 端點列表

### 目的地（公開，不需登入）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | /api/destinations | 取得目的地列表（支援分類、搜尋、分頁） |
| GET | /api/destinations/:id | 取得目的地詳情 |
| GET | /api/destinations/:id/reviews | 取得目的地的評論列表 |

**GET /api/destinations 查詢參數：**

```
?category=natural     依分類 slug 篩選
?search=九份          搜尋名稱或地點
?page=1               第幾頁（預設 1）
?limit=12             每頁幾筆（預設 12）
```

**GET /api/destinations 回應範例：**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clxxx",
        "name": "九份老街",
        "slug": "jiufen",
        "location": "台灣・新北市",
        "coverImage": "https://...",
        "rating": 4.5,
        "reviewCount": 32,
        "category": { "id": "clyyy", "name": "歷史古蹟", "icon": "🏛️", "slug": "historic" }
      }
    ],
    "total": 100,
    "page": 1,
    "totalPages": 9
  }
}
```

---

### 分類（公開）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | /api/categories | 取得所有分類 |

---

### 收藏（需登入）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | /api/favorites | 取得目前登入使用者的收藏清單 |
| POST | /api/favorites | 新增收藏 |
| DELETE | /api/favorites/:id | 移除收藏 |

**POST /api/favorites 請求 Body：**

```json
{ "destinationId": "clxxx" }
```

---

### 評論（混合：讀公開、寫需登入）

| Method | 路徑 | 說明 | 需要登入 |
|--------|------|------|----------|
| POST | /api/destinations/:id/reviews | 新增評論 | 是 |
| PATCH | /api/reviews/:id | 修改自己的評論 | 是（本人） |
| DELETE | /api/reviews/:id | 刪除自己的評論 | 是（本人或 ADMIN） |

**POST 評論請求 Body：**

```json
{
  "rating": 5,
  "comment": "景色很美，強烈推薦！"
}
```

---

### 認證（NextAuth.js）

| Method | 路徑 | 說明 |
|--------|------|------|
| GET/POST | /api/auth/[...nextauth] | NextAuth.js 統一處理，不需要自己寫 |
| GET | /api/auth/session | 取得目前登入狀態（NextAuth.js 內建） |

---

### 後台 API（需要 ADMIN 角色）

所有 `/api/admin/*` 端點都會驗證 `session.user.role === 'ADMIN'`，
一般使用者呼叫會得到 403。

#### 後台：目的地管理

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | /api/admin/destinations | 取得所有目的地（包含未上架） |
| POST | /api/admin/destinations | 新增目的地 |
| PATCH | /api/admin/destinations/:id | 更新目的地 |
| DELETE | /api/admin/destinations/:id | 刪除目的地 |

**POST 新增目的地請求 Body：**

```json
{
  "name": "九份老街",
  "slug": "jiufen",
  "description": "...",
  "location": "台灣・新北市",
  "coverImage": "https://...",
  "categoryId": "clxxx",
  "isPublished": true
}
```

#### 後台：評論管理

| Method | 路徑 | 說明 |
|--------|------|------|
| GET | /api/admin/reviews | 取得所有評論（含待審核） |
| PATCH | /api/admin/reviews/:id | 審核通過（isApproved: true）或駁回 |
| DELETE | /api/admin/reviews/:id | 刪除評論 |

---

## 錯誤代碼

| Code | 說明 |
|------|------|
| 400 | 請求參數錯誤（缺少必填欄位、格式錯誤） |
| 401 | 未登入 |
| 403 | 無權限（登入了但角色不對，例如一般使用者進 /admin） |
| 404 | 資源不存在 |
| 409 | 衝突（例如：已收藏、已評論過） |
| 500 | 伺服器內部錯誤 |

---

## API Route 範例（Next.js 寫法）

```typescript
// app/api/admin/destinations/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  // 1. 驗證是否登入且為 ADMIN
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ success: false, message: '未登入' }, { status: 401 })
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: '無權限' }, { status: 403 })
  }

  // 2. 取得並驗證 request body
  const body = await request.json()
  // 用 Zod 驗證...

  // 3. 存入資料庫
  const destination = await prisma.destination.create({ data: body })

  return NextResponse.json({ success: true, data: destination }, { status: 201 })
}
```

## 備註

- 公開端點：destinations、categories、destinations/:id/reviews（讀取）
- 需要登入：favorites、reviews（寫入）、profile
- 需要 ADMIN：/api/admin/* 所有端點
- 評論新增後 `isApproved = false`，不會立即顯示，需管理員審核
