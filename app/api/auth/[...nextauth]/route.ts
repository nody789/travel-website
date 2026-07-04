// app/api/auth/[...nextauth]/route.ts
//
// NextAuth.js 需要一個統一的路由來處理所有認證相關的請求：
// - /api/auth/signin（登入）
// - /api/auth/signout（登出）
// - /api/auth/callback/google（Google OAuth callback）
// - /api/auth/session（取得 session）
// 這個 [...nextauth] 動態路由會攔截所有 /api/auth/* 的請求

import { handlers } from '@/lib/auth'

// NextAuth.js v5 的寫法：直接匯出 GET 和 POST handler
export const { GET, POST } = handlers
