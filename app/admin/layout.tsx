// app/admin/layout.tsx — 後台共用版型（Server Component）
// middleware.ts 已保護所有 /admin/* 路由，只有 ADMIN 才能進入
// 這個 layout 加入側邊選單，所有後台頁面都會套用

import Link from 'next/link'
import { LayoutDashboard, Map, Tag, MessageSquare, Globe, ChevronRight, Image, CalendarDays } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '管理後台' }

const sidebarLinks = [
  { href: '/admin', label: '儀表板', icon: LayoutDashboard, exact: true },
  { href: '/admin/destinations', label: '目的地管理', icon: Map },
  { href: '/admin/categories', label: '分類管理', icon: Tag },
  { href: '/admin/reviews', label: '評論審核', icon: MessageSquare },
  { href: '/admin/banners', label: '輪播 Banner', icon: Image },
  { href: '/admin/events', label: '活動管理', icon: CalendarDays },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* 側邊選單 */}
      <aside className="w-56 flex-shrink-0 border-r bg-white">
        {/* 後台標題 */}
        <div className="flex items-center gap-2 px-4 py-5 border-b">
          <Globe className="h-5 w-5 text-sky-600" />
          <span className="font-semibold text-gray-900">管理後台</span>
        </div>

        <nav className="p-3 space-y-1">
          {sidebarLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主內容區 */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
