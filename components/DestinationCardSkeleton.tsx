// DestinationCardSkeleton — 目的地卡片的骨架畫面
// 在資料載入中時顯示，避免白屏，提升使用者體驗
// Server Component（純靜態，不需要互動）

export default function DestinationCardSkeleton() {
  return (
    <div className="rounded-xl border bg-white overflow-hidden animate-pulse">
      {/* 圖片佔位 */}
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        {/* 分類標籤 */}
        <div className="h-4 w-20 bg-gray-200 rounded-full" />
        {/* 標題 */}
        <div className="h-5 w-4/5 bg-gray-200 rounded" />
        {/* 地點 */}
        <div className="h-4 w-3/5 bg-gray-200 rounded" />
        {/* 評分列 */}
        <div className="flex gap-2 pt-1">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  )
}
