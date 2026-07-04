// middleware.ts — 路由保護
//
// middleware 在每個請求到達頁面之前執行。
// 這裡引入 auth.config.ts（Edge 相容），不引入 auth.ts（含 Prisma，不能在 Edge 執行）。

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// 用 Edge 相容的設定建立 auth
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth  // 目前的 session（未登入為 null）

  const isLoggedIn = !!session
  const isAdmin = session?.user.role === 'ADMIN'

  // 未登入 → 導向登入頁，並帶上原本要去的路徑（登入後自動跳回）
  const needsLogin =
    pathname.startsWith('/favorites') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/trips')
  if (needsLogin && !isLoggedIn) {
    const loginUrl = new URL('/auth/signin', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return Response.redirect(loginUrl)
  }

  // 後台路由：未登入 → 登入頁；已登入但非 ADMIN → 403
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      const loginUrl = new URL('/auth/signin', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return Response.redirect(loginUrl)
    }
    if (!isAdmin) {
      return Response.redirect(new URL('/403', req.url))
    }
  }
})

export const config = {
  matcher: ['/favorites/:path*', '/profile/:path*', '/trips/:path*', '/admin/:path*'],
}
