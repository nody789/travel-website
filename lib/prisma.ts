// Prisma 7 連線設定
//
// Prisma 7 改變了連線方式：
// - 不再把 DATABASE_URL 寫在 schema.prisma
// - 改用 adapter 模式，讓你可以自由選擇資料庫驅動程式
// - 這裡使用 @prisma/adapter-pg 搭配 pg（PostgreSQL 的 Node.js 驅動程式）

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// 宣告 global 型別，讓 TypeScript 知道 globalThis.prisma 存在
// 這個寫法是為了 Next.js 熱更新（Hot Reload）的 singleton 模式
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // 從環境變數讀取資料庫連線字串
  const connectionString = process.env.DATABASE_URL!

  // PrismaPg 是 PostgreSQL 的 adapter
  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({ adapter })
}

// singleton：開發模式下熱更新不會重新建立 PrismaClient
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
