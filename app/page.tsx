// app/page.tsx — 首頁（Server Component）
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import DestinationCard from '@/components/DestinationCard'
import CategoryFilter from '@/components/CategoryFilter'
import SearchBar from '@/components/SearchBar'
import HeroBanner from '@/components/HeroBanner'
import { Button } from '@/components/ui/button'
import { Compass, CalendarDays, MapPin, ArrowRight, Star, Map, MessageSquare, Users } from 'lucide-react'
import { Suspense } from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'

async function getHomeData() {
  const [destinations, categories, banners, events, stats] = await Promise.all([
    prisma.destination.findMany({
      where: { isPublished: true },
      select: {
        id: true, name: true, slug: true, location: true,
        coverImage: true, rating: true, reviewCount: true,
        category: { select: { id: true, name: true, icon: true, slug: true } },
      },
      orderBy: { rating: 'desc' },
      take: 6,
    }),
    prisma.category.findMany({
      include: { _count: { select: { destinations: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.banner.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }),
    prisma.event.findMany({
      where: { isActive: true, endDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 3,
    }),
    Promise.all([
      prisma.destination.count({ where: { isPublished: true } }),
      prisma.category.count(),
      prisma.review.count({ where: { isApproved: true } }),
      prisma.user.count(),
    ]),
  ])

  const [destinationCount, categoryCount, reviewCount, userCount] = stats
  return { destinations, categories, banners, events, destinationCount, categoryCount, reviewCount, userCount }
}

export default async function HomePage() {
  const { destinations, categories, banners, events, destinationCount, categoryCount, reviewCount, userCount } = await getHomeData()

  // 評分最高的目的地當精選
  const featured = destinations[0]

  return (
    <div className="flex flex-col">

      {/* ── Hero / Banner ── */}
      {banners.length > 0 ? (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <HeroBanner banners={banners} />
          <div className="mt-5 max-w-lg mx-auto">
            <Suspense><SearchBar placeholder="搜尋目的地、地點..." showPreview /></Suspense>
          </div>
        </div>
      ) : (
        <section className="relative bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-700 py-28 text-white overflow-hidden">
          {/* 裝飾圓 */}
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm mb-6">
              <Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" />
              <span>超過 {destinationCount} 個精選目的地等你探索</span>
            </div>
            <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl mb-5 tracking-tight leading-tight">
              探索世界，<br className="sm:hidden" />尋找靈感
            </h1>
            <p className="text-sky-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
              發現隱藏的美景，參考真實旅客評論，打造屬於你的完美旅程
            </p>
            <div className="max-w-lg mx-auto">
              <Suspense><SearchBar placeholder="搜尋目的地、地點..." className="text-gray-900" showPreview /></Suspense>
            </div>
          </div>
        </section>
      )}

      {/* ── 統計數字 ── */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0">
            {[
              { icon: Map, label: '精選目的地', value: destinationCount, color: 'text-sky-600' },
              { icon: Star, label: '旅客評論', value: reviewCount, color: 'text-yellow-500' },
              { icon: Compass, label: '旅遊分類', value: categoryCount, color: 'text-emerald-600' },
              { icon: Users, label: '旅遊會員', value: userCount, color: 'text-purple-600' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center justify-center py-6 px-4 text-center">
                <Icon className={`h-6 w-6 mb-2 ${color}`} />
                <p className="font-bold text-2xl text-gray-900">{value.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* ── 精選目的地（最高評分） ── */}
        {featured && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <span className="h-1 w-8 rounded bg-sky-600" />
              <h2 className="font-bold text-2xl text-gray-900">編輯精選</h2>
            </div>
            <Link
              href={`/destinations/${featured.id}`}
              className="group grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-64 md:h-full min-h-[280px]">
                <Image
                  src={featured.coverImage}
                  alt={featured.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 md:to-transparent" />
                <span className="absolute top-4 left-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-900">
                  ⭐ 本週精選
                </span>
              </div>
              <div className="flex flex-col justify-center p-8">
                <span className="text-sm font-medium text-sky-600 mb-2">
                  {featured.category.icon} {featured.category.name}
                </span>
                <h3 className="font-bold text-2xl text-gray-900 mb-3 group-hover:text-sky-600 transition-colors">
                  {featured.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {featured.location}
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(featured.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                    ))}
                  </div>
                  <span className="font-semibold text-gray-900">{featured.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm">({featured.reviewCount} 則評論)</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sky-600 font-medium text-sm group-hover:gap-3 transition-all">
                  查看詳情 <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* ── 分類探索（卡片樣式） ── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1 w-8 rounded bg-sky-600" />
            <h2 className="font-bold text-2xl text-gray-900">依分類探索</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/destinations?category=${cat.slug}`}
                className="group flex flex-col items-center gap-2 rounded-xl border bg-white p-4 text-center hover:border-sky-300 hover:bg-sky-50 hover:shadow-md transition-all"
              >
                <span className="text-3xl">{cat.icon}</span>
                <span className="font-medium text-sm text-gray-700 group-hover:text-sky-700">{cat.name}</span>
                <span className="text-xs text-gray-400">{cat._count.destinations} 個目的地</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 熱門目的地 ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="h-1 w-8 rounded bg-sky-600" />
              <h2 className="font-bold text-2xl text-gray-900">熱門目的地</h2>
            </div>
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href="/destinations">
                查看全部 <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {destinations.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              <Compass className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>目前還沒有目的地，請稍後再來！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {destinations.slice(1).map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
            </div>
          )}
        </section>

        {/* ── 近期活動 ── */}
        {events.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="h-1 w-8 rounded bg-sky-600" />
                <h2 className="font-bold text-2xl text-gray-900">近期活動</h2>
              </div>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/events">查看全部 <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href="/events"
                  className="group rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-44 bg-gray-100">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5 text-white text-xs">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {dayjs(event.startDate).format('MM/DD')} – {dayjs(event.endDate).format('MM/DD')}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-sky-600 transition-colors">
                      {event.title}
                    </h3>
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
          </section>
        )}

        {/* ── 評論牆（顯示最新 3 則已審核評論） ── */}
        <ReviewHighlights />

        {/* ── CTA ── */}
        <section className="rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-700 p-10 text-center text-white overflow-hidden relative">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="relative">
            <Compass className="h-10 w-10 mx-auto mb-4 text-sky-200" />
            <h2 className="font-bold text-3xl mb-2">準備好出發了嗎？</h2>
            <p className="text-sky-100 text-lg mb-8 max-w-xl mx-auto">
              加入 {userCount.toLocaleString()}+ 位旅遊愛好者，探索 {destinationCount} 個精選目的地
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="bg-white text-sky-700 hover:bg-sky-50 gap-2">
                <Link href="/destinations">開始探索 <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link href="/auth/register">免費註冊</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

// 評論精選區塊（Server Component）
async function ReviewHighlights() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    include: {
      user: { select: { name: true, image: true } },
      destination: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })

  if (reviews.length === 0) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="h-1 w-8 rounded bg-sky-600" />
        <h2 className="font-bold text-2xl text-gray-900">旅客心得</h2>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-xl border bg-white p-5 flex flex-col gap-3">
            {/* 星星評分 */}
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-100'}`} />
              ))}
            </div>
            {/* 評論內容 */}
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 flex-1">
              &ldquo;{review.comment}&rdquo;
            </p>
            {/* 目的地 */}
            <p className="text-xs text-sky-600 font-medium">📍 {review.destination.name}</p>
            {/* 評論者 */}
            <div className="flex items-center gap-2 pt-1 border-t">
              <div className="h-7 w-7 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 text-xs font-bold flex-shrink-0">
                {review.user.name?.charAt(0).toUpperCase() ?? '?'}
              </div>
              <span className="text-xs text-gray-500 truncate">{review.user.name ?? '匿名旅客'}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
