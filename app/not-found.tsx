// app/not-found.tsx — 客製化 404 頁面
// Next.js 特有：建立這個檔案就會自動覆蓋預設的 404 頁面
// Server Component（不需要互動）

import Link from 'next/link'
import { Compass, Home, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      {/* 大數字 404 */}
      <div className="relative mb-6">
        <p className="text-[8rem] font-bold text-gray-100 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <Compass className="h-20 w-20 text-sky-500 animate-pulse" />
        </div>
      </div>

      <h1 className="font-bold text-2xl text-gray-900 mb-2">找不到這個頁面</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        你要找的頁面可能已被移動、刪除，或是連結輸入錯誤。
        <br />
        讓我們帶你回到正確的方向。
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Next.js <Button asChild> + <Link>：SPA 導頁，不整頁重整 */}
        <Button asChild className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Link href="/">
            <Home className="h-4 w-4" />
            回到首頁
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/destinations">
            <Map className="h-4 w-4" />
            探索目的地
          </Link>
        </Button>
      </div>
    </div>
  )
}
