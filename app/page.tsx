// app/page.tsx — 首頁 /（Server Component）
//
// 為什麼是 Server Component？
// - 首頁需要 SEO：搜尋引擎要能爬到目的地資料
// - 在 server 直接取資料，使用者看到頁面時內容已經存在（不需要等 JS 載入再抓 API）
// - 傳統 React 做法：useEffect → 呼叫 API → 顯示資料（使用者會先看到空畫面）
// - Next.js Server Component 做法：async/await → 直接輸出完整 HTML

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DestinationCard from '@/components/DestinationCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import HeroBanner from '@/components/HeroBanner'
import { Button } from '@/components/ui/button'
import { Compass, CalendarDays, MapPin, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'

// 直接在 server 端取資料，不需要 useEffect 或 axios
async function getHomeData() {
  const [destinations, categories, banners, events] = await Promise.all([
    prisma.destination.findMany({
      where: { isPublished: true },
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
      orderBy: { rating: 'desc' },
      take: 6, // 首頁只顯示 6 筆熱門目的地
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    // 只取目前日期之後的活動（近期活動區塊）
    prisma.event.findMany({
      where: {
        isActive: true,
        endDate: { gte: new Date() },
      },
      orderBy: { startDate: 'asc' },
      take: 3,
    }),
  ])
  return { destinations, categories, banners, events }
}

export default async function HomePage() {
  const { destinations, categories, banners, events } = await getHomeData()

  return (
    <div>
      {/* 輪播 Banner 區塊（有 Banner 資料才顯示，否則 fallback 到靜態 Hero） */}
      {banners.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          {/* HeroBanner 是 Client Component，負責輪播互動邏輯
              資料在 Server 端取得後透過 props 傳入，保持 SEO 友好 */}
          <HeroBanner banners={banners} />

          {/* 搜尋列放在輪播下方 */}
          <div className="mt-6 max-w-lg mx-auto">
            <Suspense>
              <SearchBar placeholder="搜尋目的地、地點..." />
            </Suspense>
          </div>
        </div>
      ) : (
        // Fallback：沒有 Banner 時顯示靜態 Hero Section
        <section className="relative bg-gradient-to-br from-sky-600 to-sky-800 py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-4">
              <Compass className="h-12 w-12 text-sky-200" />
            </div>
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl mb-4 tracking-tight">
              探索世界，尋找靈感
            </h1>
            <p className="text-sky-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
              發現隱藏的美景，參考真實旅客評論，打造屬於你的完美旅程
            </p>
            <div className="max-w-lg mx-auto">
              <Suspense>
                <SearchBar placeholder="搜尋目的地、地點..." className="text-gray-900" />
              </Suspense>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* 分類篩選 */}
        <div>
          <h2 className="font-bold text-2xl text-gray-900 mb-4">依分類探索</h2>
          <Suspense>
            <CategoryFilter categories={categories} />
          </Suspense>
        </div>

        {/* 熱門目的地 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-2xl text-gray-900">熱門目的地</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/destinations">查看全部</Link>
            </Button>
          </div>

          {destinations.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Compass className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>目前還沒有目的地，請稍後再來！</p>
            </div>
          ) : (
            // RWD 格網：手機 1 欄、平板 2 欄、桌機 3 欄
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                // key 用 destination.id，不用 index
                // 原因：id 是唯一且穩定的，React 可以正確追蹤每個卡片
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          )}
        </div>

        {/* 近期活動區塊（有活動資料才顯示） */}
        {events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-2xl text-gray-900">近期活動</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/events">查看全部</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href="/events"
                  className="group rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* 活動封面圖 */}
                  <div className="relative h-40 bg-gray-100">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                    {/* dayjs 格式化日期：YYYY/MM/DD 是台灣常見格式 */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                      <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                      {dayjs(event.startDate).format('YYYY/MM/DD')} – {dayjs(event.endDate).format('MM/DD')}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA 區塊 */}
        <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-sky-700 p-8 text-center text-white">
          <h2 className="font-bold text-2xl mb-2">準備好出發了嗎？</h2>
          <p className="text-sky-100 mb-6">探索 {destinations.length > 0 ? '數十個' : ''}精選目的地，找到你的下一個旅遊靈感</p>
          <Button asChild className="bg-white text-sky-700 hover:bg-sky-50 gap-2">
            <Link href="/destinations">
              開始探索
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
