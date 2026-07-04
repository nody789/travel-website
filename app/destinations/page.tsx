// app/destinations/page.tsx — 目的地列表頁 /destinations（Server Component）
//
// Next.js App Router 特有：searchParams 是 props 傳進來的（不是 useSearchParams）
// Server Component 可以直接讀取 URL 的查詢參數，再根據參數取資料
// 這樣做的好處：每個 URL 都有對應的資料（SEO 友好、可分享連結）

import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import DestinationCard from '@/components/DestinationCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Compass } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '探索目的地',
}

interface SearchParams {
  // searchParams 在 Next.js 15+ 是 Promise（需要 await）
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 12

export default async function DestinationsPage({ searchParams }: SearchParams) {
  const { category, search, page: pageStr } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const skip = (page - 1) * ITEMS_PER_PAGE

  const where = {
    isPublished: true,
    ...(category && { category: { slug: category } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { location: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [destinations, total, categories] = await Promise.all([
    prisma.destination.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.destination.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  return (
    <div>
      {/* 頁頭色塊 */}
      <div className="bg-gradient-to-br from-sky-600 to-indigo-700 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="font-bold text-4xl mb-3">探索目的地</h1>
          <p className="text-sky-100 mb-7">發現 {total} 個精選旅遊地點，從自然美景到城市探索</p>
          <Suspense>
            <SearchBar placeholder="搜尋名稱、地點..." className="max-w-lg" />
          </Suspense>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* 分類篩選 */}
        <div className="mb-6">
          <Suspense>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>

        {/* 結果資訊 */}
        <p className="text-sm text-gray-500 mb-6">
          共找到 <span className="font-medium text-gray-700">{total}</span> 個目的地
          {search && <span>（搜尋：「{search}」）</span>}
          {category && <span>（分類篩選中）</span>}
        </p>

        {/* 目的地格網 */}
        {destinations.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <Compass className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">找不到符合條件的目的地</p>
            <p className="text-sm mt-1 text-gray-400">試試看其他關鍵字或分類</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        )}

        {/* 分頁器 */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            {page > 1 && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/destinations?${buildParams({ category, search, page: page - 1 })}`}>
                  ← 上一頁
                </Link>
              </Button>
            )}
            <span className="px-3 text-sm text-gray-500 font-medium">
              第 {page} 頁，共 {totalPages} 頁
            </span>
            {page < totalPages && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/destinations?${buildParams({ category, search, page: page + 1 })}`}>
                  下一頁 →
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 組合分頁連結的查詢參數，undefined 的欄位不加入
function buildParams(params: { category?: string; search?: string; page: number }) {
  const p = new URLSearchParams()
  if (params.category) p.set('category', params.category)
  if (params.search) p.set('search', params.search)
  p.set('page', String(params.page))
  return p.toString()
}
