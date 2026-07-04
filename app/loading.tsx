// app/loading.tsx — 根路由的全域 loading 狀態
// Next.js 特有：這個檔案讓所有頁面切換時都有載入畫面
// 顯示時機：使用者從一個頁面切換到另一個頁面，新頁面還在 server 端取資料時

export default function RootLoading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* 旋轉圈圈 */}
        <div className="h-10 w-10 rounded-full border-4 border-gray-200 border-t-sky-600 animate-spin" />
        <p className="text-sm text-gray-500">載入中...</p>
      </div>
    </div>
  )
}
