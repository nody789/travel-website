# 旅遊探索網站（Travel Explorer）

一個讓使用者瀏覽旅遊目的地、搜尋景點、收藏喜愛行程的旅遊資訊網站。

## 技術棧

- **框架**：Next.js 14（App Router）
- **語言**：TypeScript
- **樣式**：Tailwind CSS + shadcn/ui
- **資料庫**：PostgreSQL + Prisma
- **部署**：Vercel

## 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數
cp .env.example .env.local

# 3. 啟動資料庫
docker compose up -d

# 4. 建立資料表
npx prisma migrate dev

# 5. 啟動開發伺服器
npm run dev
```

打開 http://localhost:3000 即可查看。

## 文件

| 文件 | 說明 |
|------|------|
| [docs/PROJECT.md](docs/PROJECT.md) | 專案目標、技術棧、目錄結構 |
| [docs/API.md](docs/API.md) | API 端點規格 |
| [docs/DATABASE.md](docs/DATABASE.md) | 資料表結構 |
| [docs/UI_RULES.md](docs/UI_RULES.md) | UI 設計規範 |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | 版本異動紀錄 |
| [docs/NEXTJS_TYPESCRIPT_GUIDE.md](docs/NEXTJS_TYPESCRIPT_GUIDE.md) | **Next.js + TypeScript 學習指南** |
