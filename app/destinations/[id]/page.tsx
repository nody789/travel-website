// app/destinations/[id]/page.tsx — 目的地詳情頁（Server Component）
//
// 動態路由 [id]：URL /destinations/abc123 → id = 'abc123'
// params 在 Next.js 15+ 是 Promise，需要 await
//
// 差異：傳統 React 用 useParams() hook，Next.js Server Component 直接 await params

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star, MessageCircle, Tag, ChevronRight, Home, CheckCircle2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ReviewCard from '@/components/ReviewCard'
import FavoriteButton from '@/components/FavoriteButton'
import AddToTripButton from '@/components/AddToTripButton'
import ReviewForm from '@/components/ReviewForm'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// 根據分類 slug 回傳旅遊亮點（讓頁面更豐富，不需要額外資料庫欄位）
function getHighlights(categorySlug: string): string[] {
  const map: Record<string, string[]> = {
    nature:    ['自然生態探索', '壯麗山川景色', '絕美拍照聖地', '清新空氣洗滌', '健行步道體驗', '近距離野生動物'],
    city:      ['城市文化風情', '道地在地美食', '購物娛樂天堂', '歷史建築巡禮', '精彩夜生活', '藝文展覽空間'],
    beach:     ['潔白沙灘日光浴', '清澈海水戲水', '豐富水上活動', '醉人日落美景', '新鮮海鮮料理', '浮潛深潛探索'],
    mountain:  ['高山壯麗雪景', '登山健行路線', '療癒森林浴', '清晨雲海奇觀', '星空露營體驗', '山村文化巡禮'],
    historic:  ['千年歷史古蹟', '世界文化遺產', '傳統建築之美', '在地民俗藝術', '博物館深度探索', '古典文化沉浸'],
    adventure: ['極限冒險體驗', '戶外挑戰活動', '刺激感官享受', '專業嚮導帶隊', '打卡紀念時刻', '挑戰自我極限'],
    food:      ['米其林級美食', '道地街頭小吃', '市場文化探索', '烹飪課程體驗', '在地食材之旅', '特色餐廳巡禮'],
  }
  return map[categorySlug] ?? ['精彩旅遊體驗', '絕美風景拍照', '豐富文化探索', '美食品嚐享受', '深度在地體驗', '難忘旅程回憶']
}

// 計算各星級評論數量，用於評分分佈條
function getRatingBreakdown(reviews: Array<{ rating: number }>) {
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating]++
  })
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: counts[star],
    percent: reviews.length > 0 ? Math.round((counts[star] / reviews.length) * 100) : 0,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const destination = await prisma.destination.findUnique({
    where: { id, isPublished: true },
    select: { name: true, description: true, coverImage: true },
  })
  if (!destination) return { title: '目的地不存在' }
  return {
    title: destination.name,
    description: destination.description.slice(0, 160),
    openGraph: { images: [destination.coverImage] },
  }
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const [destination, reviews, userFavorite] = await Promise.all([
    prisma.destination.findUnique({
      where: { id, isPublished: true },
      include: { category: true },
    }),
    prisma.review.findMany({
      where: { destinationId: id, isApproved: true },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    session
      ? prisma.favorite.findUnique({
          where: { userId_destinationId: { userId: session.user.id, destinationId: id } },
        })
      : null,
  ])

  if (!destination) notFound()

  // 查詢同分類的其他目的地（最多 3 筆，排除自己）
  const related = await prisma.destination.findMany({
    where: { categoryId: destination.categoryId, isPublished: true, id: { not: id } },
    select: { id: true, name: true, location: true, coverImage: true, rating: true },
    orderBy: { rating: 'desc' },
    take: 3,
  })

  const hasReviewed = session ? reviews.some((r) => r.userId === session.user.id) : false
  const highlights = getHighlights(destination.category.slug)
  const ratingBreakdown = getRatingBreakdown(reviews)

  return (
    <div>
      {/* ── Hero 大圖區（文字覆蓋在圖片上） ── */}
      <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
        <Image
          src={destination.coverImage}
          alt={destination.name}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* 漸層遮罩：從透明到深黑，讓底部文字清楚可讀 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* 右上角收藏按鈕 */}
        <div className="absolute right-5 top-5">
          <FavoriteButton destinationId={destination.id} favoriteId={userFavorite?.id} />
        </div>

        {/* Breadcrumb 導覽（左上角） */}
        <nav className="absolute left-5 top-5 flex items-center gap-1.5 text-white/80 text-sm">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />首頁
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <Link href="/destinations" className="hover:text-white transition-colors">目的地</Link>
          <ChevronRight className="h-3.5 w-3.5 text-white/40" />
          <Link
            href={`/destinations?category=${destination.category.slug}`}
            className="hover:text-white transition-colors"
          >
            {destination.category.name}
          </Link>
        </nav>

        {/* 圖片底部：目的地名稱、評分、地點 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-3"
            >
              {destination.category.icon} {destination.category.name}
            </Badge>
            <h1 className="font-bold text-3xl sm:text-5xl text-white mb-3 leading-tight drop-shadow-md">
              {destination.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-white/70" />
                <span>{destination.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {destination.rating > 0 ? (
                  <>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{destination.rating.toFixed(1)}</span>
                    <span className="text-white/60">（{destination.reviewCount} 則評論）</span>
                  </>
                ) : (
                  <span className="text-white/60">尚無評分</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-white/70" />
                <span>{destination.reviewCount > 0 ? `${destination.reviewCount} 位旅客造訪` : '尚無訪客評論'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 主體內容（左 2/3 + 右 sidebar 1/3） ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">

          {/* ── 左欄：主要內容 ── */}
          <div className="lg:col-span-2 space-y-10">

            {/* 關於這個目的地 */}
            <section>
              <h2 className="font-bold text-2xl text-gray-900 mb-4 flex items-center gap-2">
                <span className="h-1 w-6 rounded bg-sky-600 inline-block" />
                關於這個目的地
              </h2>
              <p className="text-gray-700 leading-loose whitespace-pre-line text-[15px]">
                {destination.description}
              </p>
            </section>

            {/* 旅遊亮點（Highlights） */}
            <section>
              <h2 className="font-bold text-2xl text-gray-900 mb-5 flex items-center gap-2">
                <span className="h-1 w-6 rounded bg-sky-600 inline-block" />
                旅遊亮點
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {highlights.map((h) => (
                  <div
                    key={h}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3.5"
                  >
                    <CheckCircle2 className="h-5 w-5 text-sky-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 評論區 */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <span className="h-1 w-6 rounded bg-sky-600 inline-block" />
                <h2 className="font-bold text-2xl text-gray-900">
                  旅客評論
                </h2>
                {reviews.length > 0 && (
                  <span className="text-base font-normal text-gray-400">（{reviews.length} 則）</span>
                )}
              </div>

              {/* 評分分佈統計 */}
              {reviews.length > 0 && (
                <div className="rounded-2xl border bg-white p-6 mb-6">
                  <div className="flex items-center gap-8">
                    {/* 左：大數字 */}
                    <div className="text-center flex-shrink-0">
                      <p className="text-5xl font-bold text-gray-900">{destination.rating.toFixed(1)}</p>
                      <div className="flex justify-center gap-0.5 my-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`h-4 w-4 ${s <= Math.round(destination.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-100'}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">{reviews.length} 則評論</p>
                    </div>
                    {/* 右：分佈條 */}
                    <div className="flex-1 space-y-2">
                      {ratingBreakdown.map(({ star, count, percent }) => (
                        <div key={star} className="flex items-center gap-2.5 text-sm">
                          <span className="w-4 text-right text-gray-500 font-medium">{star}</span>
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                          <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-yellow-400 transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 評論表單 */}
              {session && !hasReviewed && (
                <div className="mb-6">
                  <ReviewForm destinationId={destination.id} />
                </div>
              )}
              {!session && (
                <div className="mb-6 rounded-xl border border-dashed border-gray-200 p-6 text-center text-gray-500">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    <Link href="/auth/signin" className="text-sky-600 hover:underline font-medium">
                      登入
                    </Link>{' '}
                    後才能留下評論
                  </p>
                </div>
              )}
              {session && hasReviewed && (
                <div className="mb-6 rounded-xl bg-sky-50 border border-sky-100 p-4 text-sm text-sky-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                  你已經評論過這個目的地了
                </div>
              )}

              {/* 評論列表 */}
              {reviews.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <MessageCircle className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                  <p>還沒有評論，成為第一個留言的旅客！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── 右欄：Sidebar ── */}
          <div className="lg:col-span-1">
            {/* sticky top：頁面滾動時 sidebar 黏在畫面上 */}
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* 快速資訊卡 */}
              <div className="rounded-2xl border bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">目的地資訊</h3>
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-sky-50 p-2 flex-shrink-0">
                      <MapPin className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">地點</p>
                      <p className="text-sm font-medium text-gray-800">{destination.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-orange-50 p-2 flex-shrink-0">
                      <Tag className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">分類</p>
                      <p className="text-sm font-medium text-gray-800">
                        {destination.category.icon} {destination.category.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-yellow-50 p-2 flex-shrink-0">
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">旅客評分</p>
                      <p className="text-sm font-medium text-gray-800">
                        {destination.rating > 0
                          ? `${destination.rating.toFixed(1)} 分（${destination.reviewCount} 則評論）`
                          : '尚無評分'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-purple-50 p-2 flex-shrink-0">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">旅客評論</p>
                      <p className="text-sm font-medium text-gray-800">
                        {destination.reviewCount > 0
                          ? `${destination.reviewCount} 位旅客留言`
                          : '尚無旅客評論'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 收藏按鈕（sidebar 大按鈕版） */}
                <div className="mt-5 pt-4 border-t space-y-2">
                  <FavoriteButton
                    destinationId={destination.id}
                    favoriteId={userFavorite?.id}
                    variant="full"
                  />
                  {/* 加入行程規劃按鈕（Client Component） */}
                  <AddToTripButton destinationId={destination.id} />
                </div>
              </div>

              {/* 同分類相關目的地 */}
              {related.length > 0 && (
                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {destination.category.icon} 同類型目的地
                  </h3>
                  <div className="space-y-3">
                    {related.map((dest) => (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.id}`}
                        className="group flex items-center gap-3 rounded-xl overflow-hidden hover:bg-gray-50 transition-colors p-1 -mx-1"
                      >
                        <div className="relative h-14 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={dest.coverImage}
                            alt={dest.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-sky-600 transition-colors">
                            {dest.name}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{dest.location}</span>
                          </div>
                          {dest.rating > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-gray-500">{dest.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href={`/destinations?category=${destination.category.slug}`}
                    className="block mt-4 text-center text-xs text-sky-600 hover:text-sky-700 font-medium"
                  >
                    查看更多 {destination.category.name} →
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
