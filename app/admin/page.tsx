// app/admin/page.tsx — 後台儀表板 /admin（Server Component）

import { prisma } from '@/lib/prisma'
import { Map, MessageSquare, Users, Eye } from 'lucide-react'

export default async function AdminDashboard() {
  const [
    destinationTotal,
    destinationPublished,
    pendingReviewCount,
    totalReviewCount,
    userCount,
  ] = await Promise.all([
    prisma.destination.count(),
    prisma.destination.count({ where: { isPublished: true } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count(),
    prisma.user.count(),
  ])

  const stats = [
    {
      label: '目的地總數',
      value: destinationTotal,
      sub: `${destinationPublished} 個已上架`,
      icon: Map,
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
        </div>
      </div>
    </div>
  )
}
