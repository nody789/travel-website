// app/admin/page.tsx — 後台儀表板 /admin（Server Component）
//
// Server Component 直接從 DB 取統計數字和近 6 個月的資料，
// 再傳給 DashboardCharts（Client Component）渲染圖表

import { prisma } from '@/lib/prisma'
import { Map as MapIcon, MessageSquare, Users, Eye } from 'lucide-react'
import DashboardCharts from '@/components/admin/DashboardCharts'

// 把 Date[] 按 YYYY/MM 分組，回傳 Map<'YYYY/MM', count>
function groupByMonth(dates: Array<{ createdAt: Date | string }>): Map<string, number> {
  const map = new Map<string, number>()
  for (const { createdAt } of dates) {
    const d = new Date(createdAt)
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

export default async function AdminDashboard() {
  const now = new Date()
  // 6 個月前的第 1 天
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)

  const [
    destinationTotal,
    destinationPublished,
    pendingReviewCount,
    totalReviewCount,
    userCount,
    // 近 6 個月的原始資料（只取 createdAt 欄位，用來分組計數）
    monthlyDestRaw,
    monthlyReviewRaw,
    monthlyUserRaw,
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.destination.count({ where: { isPublished: true } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count(),
    prisma.user.count(),
    prisma.destination.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.review.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ])

  // 分組計數
  const destMap = groupByMonth(monthlyDestRaw)
  const reviewMap = groupByMonth(monthlyReviewRaw)
  const userMap = groupByMonth(monthlyUserRaw)

  // 組出近 6 個月的完整標籤陣列（即使某月沒資料也顯示 0）
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
    const key = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    return {
      month: `${d.getMonth() + 1}月`,
      destinations: destMap.get(key) ?? 0,
      reviews: reviewMap.get(key) ?? 0,
      users: userMap.get(key) ?? 0,
    }
  })

  const stats = [
    {
      label: '目的地總數',
      value: destinationTotal,
      sub: `${destinationPublished} 個已上架`,
      icon: MapIcon,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      label: '待審核評論',
      value: pendingReviewCount,
      sub: `共 ${totalReviewCount} 則評論`,
      icon: MessageSquare,
      color: pendingReviewCount > 0 ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600',
    },
    {
      label: '會員總數',
      value: userCount,
      sub: '已註冊使用者',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: '已上架目的地',
      value: destinationPublished,
      sub: `共 ${destinationTotal} 個目的地`,
      icon: Eye,
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div>
      <h1 className="font-bold text-2xl text-gray-900 mb-8">儀表板</h1>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* 圖表區（Client Component，需要瀏覽器 API）
          Server Component 取完資料後，以 props 傳給 Client Component */}
      <DashboardCharts data={monthlyData} />

      {/* 快捷連結 */}
      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-lg text-gray-900 mb-4">快捷操作</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/destinations/new"
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
          >
            新增目的地
          </a>
          <a
            href="/admin/reviews"
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            審核評論
            {pendingReviewCount > 0 && (
              <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-600">
                {pendingReviewCount}
              </span>
            )}
          </a>
          <a
            href="/admin/categories"
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            管理分類
          </a>
          <a
            href="/admin/banners"
            className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            輪播 Banner
          </a>
        </div>
      </div>
    </div>
  )
}
