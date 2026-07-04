// app/destinations/[id]/page.tsx — 目的地詳情頁（Server Component）
//
// 動態路由 [id]：這個 id 從 URL 取得，例如 /destinations/abc123 → id = 'abc123'
// params 在 Next.js 15+ 是 Promise，需要 await 才能取得 id
//
// Next.js 和傳統 React 的差異：
// 傳統 React：用 useParams() hook 取得 id，然後 useEffect 呼叫 API
// Next.js Server Component：直接 await params，再用 Prisma 查資料庫，不需要 API 層

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Star, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ReviewCard from '@/components/ReviewCard'
import FavoriteButton from '@/components/FavoriteButton'
import ReviewForm from '@/components/ReviewForm'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

// generateMetadata：動態產生每個目的地頁的 SEO 標題和描述
// Next.js 會在 server 端呼叫這個函式，不需要 Client Component
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const destination = await prisma.destination.findUnique({
    where: { id, isPublished: true },
    select: { name: true, description: true },
  })

  if (!destination) return { title: '目的地不存在' }

  return {
    title: destination.name,
    description: destination.description.slice(0, 160),
  }
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { id } = await params

  // 取得目前登入的使用者（Server Component 用 auth()）
  const session = await auth()

  // 並行取得目的地、評論、以及目前使用者的收藏狀態
  const [destination, reviews, userFavorite] = await Promise.all([
    prisma.destination.findUnique({
      where: { id, isPublished: true },
      include: { category: true },
    }),
    prisma.review.findMany({
      where: { destinationId: id, isApproved: true },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    // 只有登入時才查收藏狀態；未登入直接回 null
    session
      ? prisma.favorite.findUnique({
          where: {
            userId_destinationId: {
              userId: session.user.id,
              destinationId: id,
            },
          },
        })
      : null,
  ])

  // notFound()：告訴 Next.js 這個頁面不存在，自動顯示 404 頁面
  if (!destination) notFound()

  // 判斷目前使用者是否已對這個目的地留過評論
  const hasReviewed = session
    ? reviews.some((r) => r.userId === session.user.id)
    : false

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* 封面圖 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-8">
        <Image
          src={destination.coverImage}
          alt={destination.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 1280px) 100vw, 1024px"
        />
        {/* 收藏按鈕：右上角 */}
        <div className="absolute right-4 top-4">
          <FavoriteButton
            destinationId={destination.id}
            favoriteId={userFavorite?.id}
          />
        </div>
      </div>

      {/* 基本資訊 */}
      <div className="mb-8 space-y-3">
        <Badge variant="secondary" className="text-sm">
          {destination.category.icon} {destination.category.name}
        </Badge>
        <h1 className="font-bold text-4xl text-gray-900">{destination.name}</h1>
        <div className="flex items-center gap-4 text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{destination.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-gray-900">
              {destination.rating > 0 ? destination.rating.toFixed(1) : '尚無評分'}
            </span>
            {destination.reviewCount > 0 && (
              <span className="text-sm">({destination.reviewCount} 則評論)</span>
            )}
          </div>
        </div>
      </div>

      {/* 詳細描述 */}
      <div className="mb-12">
        <h2 className="font-semibold text-xl text-gray-900 mb-4">關於這個目的地</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {destination.description}
        </p>
      </div>

      {/* 評論區 */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-gray-600" />
          <h2 className="font-semibold text-xl text-gray-900">
            旅客評論
            {reviews.length > 0 && (
              <span className="ml-2 text-base font-normal text-gray-500">
                ({reviews.length} 則)
              </span>
            )}
          </h2>
        </div>

        {/* 已登入且尚未評論：顯示評論表單 */}
        {session && !hasReviewed && (
          <div className="mb-8">
            <ReviewForm destinationId={destination.id} />
          </div>
        )}

        {/* 未登入：提示登入才能評論 */}
        {!session && (
          <div className="mb-8 rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
            <p>
              <a href="/auth/signin" className="text-sky-600 hover:underline font-medium">
                登入
              </a>{' '}
              後才能留下評論
            </p>
          </div>
        )}

        {/* 已評論：提示 */}
        {session && hasReviewed && (
          <div className="mb-8 rounded-lg bg-sky-50 border border-sky-200 p-4 text-sm text-sky-700">
            你已經評論過這個目的地了
          </div>
        )}

        {/* 評論列表 */}
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">還沒有評論，成為第一個留言的人！</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
