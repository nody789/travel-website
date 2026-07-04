// auth.ts — 完整認證設定（Node.js 環境）
//
// 這個檔案加入 Prisma Adapter，讓 NextAuth.js 把使用者資料存進資料庫。
// 只能在 Node.js 環境（API Routes、Server Components）使用，不能在 middleware 用。

import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/lib/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,  // 繼承 auth.config.ts 的所有設定

  // Prisma Adapter：自動處理 user、account、session 的資料庫操作
  adapter: PrismaAdapter(prisma),

  // 覆寫 providers，補上 CredentialsProvider 的 authorize 邏輯
  providers: [
    ...authConfig.providers.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (p) => (p as any).id !== 'credentials'
    ),
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: '密碼', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        // bcrypt.compare：安全地比對密碼和雜湊值，不能直接比較字串
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return user
      },
    }),
  ],
})
