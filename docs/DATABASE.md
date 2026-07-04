# DATABASE.md

## 資料庫類型

PostgreSQL（透過 Prisma ORM 操作）

## 連線設定

```env
DATABASE_URL="postgresql://user:password@localhost:5432/travel_db"
```

## 資料表說明

### users（使用者）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING (CUID) | 主鍵 |
| email | VARCHAR | 電子信箱（唯一） |
| name | VARCHAR | 使用者名稱 |
| image | VARCHAR? | 頭像 URL |
| role | ENUM | `USER`（一般會員）或 `ADMIN`（管理員） |
| emailVerified | TIMESTAMP? | Email 驗證時間（NextAuth.js 需要） |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

> `role` 預設為 `USER`，要升為 ADMIN 需手動在資料庫或後台設定。

### accounts（OAuth 帳號關聯）

NextAuth.js 需要的資料表，用來儲存 Google/GitHub 的 OAuth token。

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING | 主鍵 |
| userId | STRING | 外鍵，關聯 users |
| provider | VARCHAR | 登入來源（google、github、credentials） |
| providerAccountId | VARCHAR | 對應 provider 的帳號 ID |
| access_token | TEXT? | OAuth access token |
| refresh_token | TEXT? | OAuth refresh token |
| expires_at | INT? | Token 過期時間 |

### sessions（登入 Session）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING | 主鍵 |
| sessionToken | VARCHAR | Session token（唯一） |
| userId | STRING | 外鍵，關聯 users |
| expires | TIMESTAMP | Session 過期時間 |

### verification_tokens（Email 驗證 Token）

| 欄位 | 型別 | 說明 |
|------|------|------|
| identifier | VARCHAR | Email 或識別字串 |
| token | VARCHAR | 驗證 token |
| expires | TIMESTAMP | 過期時間 |

### destinations（旅遊目的地）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING (CUID) | 主鍵 |
| name | VARCHAR | 目的地名稱（例：九份老街） |
| slug | VARCHAR | URL 友善名稱（例：jiufen），唯一 |
| description | TEXT | 詳細描述 |
| location | VARCHAR | 所在地區（例：台灣・新北市） |
| coverImage | VARCHAR | 封面圖片 URL |
| rating | FLOAT | 自動計算的平均評分（由 reviews 算出） |
| reviewCount | INT | 評論總數（快取值，避免每次重新計算） |
| isPublished | BOOLEAN | 是否上架（後台可控制顯示/隱藏） |
| categoryId | STRING | 外鍵，關聯 categories |
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |

### categories（分類）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING (CUID) | 主鍵 |
| name | VARCHAR | 分類名稱（例：自然景觀、歷史古蹟） |
| icon | VARCHAR | emoji 或 icon 名稱 |
| slug | VARCHAR | URL 友善名稱，唯一 |

### favorites（收藏）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING (CUID) | 主鍵 |
| userId | STRING | 外鍵，關聯 users |
| destinationId | STRING | 外鍵，關聯 destinations |
| created_at | TIMESTAMP | 收藏時間 |

### reviews（評論）

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | STRING (CUID) | 主鍵 |
| userId | STRING | 外鍵，關聯 users |
| destinationId | STRING | 外鍵，關聯 destinations |
| rating | INT | 評分 1-5 |
| comment | TEXT | 評論內容 |
| isApproved | BOOLEAN | 是否通過管理員審核（預設 false） |
| created_at | TIMESTAMP | 評論時間 |
| updated_at | TIMESTAMP | 更新時間 |

## 資料表關聯

```
users        1──N  accounts
users        1──N  sessions
users        1──N  favorites
users        1──N  reviews
categories   1──N  destinations
destinations 1──N  favorites
destinations 1──N  reviews
```

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  role          Role      @default(USER)
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]
  favorites     Favorite[]
  reviews       Review[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// NextAuth.js 必要的三個資料表
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

model Category {
  id           String        @id @default(cuid())
  name         String
  icon         String
  slug         String        @unique
  destinations Destination[]
}

model Destination {
  id          String     @id @default(cuid())
  name        String
  slug        String     @unique
  description String     @db.Text
  location    String
  coverImage  String
  rating      Float      @default(0)
  reviewCount Int        @default(0)
  isPublished Boolean    @default(false)
  categoryId  String
  category    Category   @relation(fields: [categoryId], references: [id])
  favorites   Favorite[]
  reviews     Review[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Favorite {
  id            String      @id @default(cuid())
  userId        String
  destinationId String
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now())
  @@unique([userId, destinationId])
}

model Review {
  id            String      @id @default(cuid())
  userId        String
  destinationId String
  rating        Int
  comment       String      @db.Text
  isApproved    Boolean     @default(false)
  user          User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  @@unique([userId, destinationId]) // 同一使用者對同一目的地只能留一則評論
}
```

## 索引說明

- `destinations.slug`：唯一索引，URL 查詢用
- `categories.slug`：唯一索引
- `favorites.[userId, destinationId]`：複合唯一索引，防止重複收藏
- `reviews.[userId, destinationId]`：複合唯一索引，防止重複評論
- `accounts.[provider, providerAccountId]`：NextAuth.js 需要

## 備註

- `destinations.rating` 和 `reviewCount` 是快取值，每次新增/刪除 review 後更新（不每次重新計算，節省效能）
- `reviews.isApproved`：新評論預設不顯示，管理員在後台審核後才公開
- `destinations.isPublished`：管理員可隱藏目的地，不影響既有資料
- 軟刪除（soft delete）：目前不使用，直接刪除資料（上線後視需求加入）
