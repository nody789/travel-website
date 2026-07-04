// app/favorites/page.tsx — 收藏清單 /favorites（Server Component）
// 這個頁面在 middleware.ts 已設定需要登入，未登入的請求會被導向 /auth/signin

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DestinationCard from '@/components/DestinationCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '我的收藏' }

export default async function FavoritesPage() {
  // Server Component 用 auth()，不是 useSession()
  const session = await auth()

  const favorites = await prisma.favorite.findMany({
    where: { userId: session!.user.id },
    include: {
      destination: {
        select: {
          id: true,
          name: true,
          slug: true,
          location: true,
          coverImage: true,
          rating: true,
          reviewCount: true,
          category: { select: { id: true, name: true, icon: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 text-orange-500 fill-orange-500" />
        <h1 className="font-bold text-4xl text-gray-900">我的收藏</h1>
      </div>

      {favorites.length === 0 ? (
        <div className="py-24 text-center">
          <Heart className="h-16 w-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-500 text-lg mb-6">還沒有收藏任何目的地</p>
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/destinations">去探索目的地</Link>
          </Button>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-6">共收藏了 {favorites.length} 個目的地</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <DestinationCard
                key={favorite.id}
                destination={favorite.destination}
                // 傳入 favoriteId 讓 FavoriteButton 知道可以直接刪除
                favoriteId={favorite.id}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
