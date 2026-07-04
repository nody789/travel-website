// app/destinations/loading.tsx
// Next.js 特有：這個 loading.tsx 會在 destinations 頁面資料還沒好時自動顯示
// 不需要手動判斷 isLoading — Next.js 的 Suspense 機制自動處理
// 與傳統 React 的差異：傳統 React 需要自己管理 loading state，Next.js 直接用檔案名稱約定

import DestinationCardSkeleton from '@/components/DestinationCardSkeleton'

export default function DestinationsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜尋列骨架 */}
      <div className="h-10 w-full max-w-md bg-gray-200 rounded-lg animate-pulse mb-8" />

      {/* 篩選列骨架 */}
      <div className="flex gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>

      {/* 卡片骨架格網 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <DestinationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
