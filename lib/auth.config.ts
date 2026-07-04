// auth.config.ts — Edge Runtime 相容的認證設定
//
// 為什麼要把設定拆成兩個檔案？
// middleware.ts 在 Edge Runtime 執行（Vercel 的邊緣伺服器），
// Edge Runtime 不支援 Prisma（需要 Node.js API）。
//
// 解法：
// - auth.config.ts：只放 Edge Runtime 可以用的設定（providers 的基本設定、callbacks）
// - auth.ts：完整設定，加入 Prisma Adapter（只在 Node.js 環境執行）
// - middleware.ts：從這個 Edge 相容的設定建立 auth，不引入 Prisma

import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import LineProvider from 'next-auth/providers/line'
import type { Role } from '@/types'

export const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
    // Credentials provider 在這裡只宣告 credentials 欄位
    // 實際的 authorize 邏輯放在 auth.ts（需要 Prisma，不能在 Edge 執行）
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: '密碼', type: 'password' },
      },
      async authorize() {
        return null  // 實際邏輯在 auth.ts 覆寫
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    // jwt 和 session callback 在 Edge Runtime 可以執行（只操作 token 物件）
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role: Role }).role
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
      }
      return session
    },
  },
}
