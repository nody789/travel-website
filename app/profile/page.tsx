// app/profile/page.tsx — 個人資料頁 /profile（Server Component）
// 由 middleware.ts 保護，需要登入

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, User } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '個人資料' }

export default async function ProfilePage() {
  const session = await auth()

  // 取得使用者統計資料（收藏數、評論數）
  const [favoriteCount, reviewCount] = await Promise.all([
    prisma.favorite.count({ where: { userId: session!.user.id } }),
    prisma.review.count({ where: { userId: session!.user.id } }),
  ])

  const initials = session!.user.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <User className="h-6 w-6 text-gray-600" />
        <h1 className="font-bold text-4xl text-gray-900">個人資料</h1>
      </div>

      {/* 使用者資訊卡片 */}
      <div className="rounded-xl border bg-white p-8 space-y-6">
        {/* 頭像 + 名稱 */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session!.user.image ?? ''} alt={session!.user.name ?? ''} />
            <AvatarFallback className="bg-sky-100 text-sky-700 text-2xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-2xl text-gray-900">
              {session!.user.name ?? '使用者'}
            </h2>
            <p className="text-gray-500">{session!.user.email}</p>
            {/* 角色標籤：ADMIN 顯示藍色，USER 顯示灰色 */}
            <Badge
              className="mt-2"
              variant={session!.user.role === 'ADMIN' ? 'default' : 'secondary'}
            >
              {session!.user.role === 'ADMIN' ? '管理員' : '一般會員'}
            </Badge>
          </div>
        </div>

        {/* 統計數字 */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center gap-3 rounded-lg bg-orange-50 p-4">
            <Heart className="h-8 w-8 text-orange-500 fill-orange-200" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{favoriteCount}</p>
              <p className="text-sm text-gray-500">收藏目的地</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-sky-50 p-4">
            <MessageCircle className="h-8 w-8 text-sky-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviewCount}</p>
              <p className="text-sm text-gray-500">撰寫評論</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
