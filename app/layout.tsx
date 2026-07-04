// app/layout.tsx — 全站共用根 Layout（Server Component）
//
// Next.js App Router 和傳統 React 的差異：
// 這個 layout 是 Server Component，只在 server 執行一次。
// 不能用 useState、useEffect，但可以直接 async/await。
// children 是巢狀路由的頁面內容，Next.js 自動傳入。

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Providers from '@/components/Providers'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
})

export const metadata: Metadata = {
  title: {
    default: 'Travel Explorer — 探索旅遊目的地',
    // %s 會被子頁面的 title 取代，例如「九份老街 | Travel Explorer」
    template: '%s | Travel Explorer',
  },
  description: '探索世界各地的旅遊目的地，收藏你的夢想行程，參考真實旅客評論。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        {/* Providers 包含 SessionProvider（讓 Client Component 可以用 useSession）
            和 Toaster（全域 toast 通知） */}
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
