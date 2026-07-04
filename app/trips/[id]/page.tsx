// app/trips/[id]/page.tsx — 行程詳情頁（Server Component）
// 顯示行程中所有目的地，支援移除目的地（Client Component）

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home, MapPin, Star, Route, CalendarDays, Pencil } from 'lucide-react'
import TripDestinationList from '@/components/TripDestinationList'
import EditTripTitle from '@/components/EditTripTitle'
import dayjs from 'dayjs'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const trip = await prisma.trip.findUnique({ where: { id }, select: { title: true } })
  return { title: trip ? `行程：${trip.title}` : '行程詳情' }
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params
  const session = await auth()

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      destinations: {
        include: {
          destination: {
            include: { category: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  // 只有行程擁有者才能查看
  if (!trip || trip.userId !== session!.user.id) notFound()

  return (
    <div>
      {/* Hero 區 */}
      <div className="bg-gradient-to-br from-sky-600 to-indigo-700 py-12 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />首頁
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            <Link href="/trips" className="hover:text-white transition-colors">我的行程</Link>
            <ChevronRight className="h-3.5 w-3.5 text-white/40" />
            <span className="text-white/90 truncate max-w-[200px]">{trip.title}</span>
          </nav>

          {/* 行程標題 + 編輯 */}
          <div className="flex items-start gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-3xl sm:text-4xl break-words">{trip.title}</h1>
              {trip.description && (
                <p className="text-sky-100 mt-2 text-sm">{trip.description}</p>
              )}
            </div>
            {/* EditTripTitle — Client Component，在原地編輯標題 */}
            <EditTripTitle tripId={trip.id} initialTitle={trip.title} initialDescription={trip.description ?? ''} />
          </div>

          {/* 統計 */}
          <div className="flex items-center gap-5 text-sm text-sky-100">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {trip.destinations.length} 個目的地
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              建立於 {dayjs(trip.createdAt).format('YYYY/MM/DD')}
            </span>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {trip.destinations.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
            <Route className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-600 mb-1">行程中還沒有目的地</h3>
            <p className="text-sm text-gray-400 mb-4">
              前往目的地頁面，用「加入行程規劃」把地點加進來
            </p>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
            >
              瀏覽目的地
            </Link>
          </div>
        ) : (
          // TripDestinationList — Client Component（需要互動：移除按鈕）
          <TripDestinationList
            tripId={trip.id}
            destinations={trip.destinations.map((td) => ({
              tripDestId: td.id,
              order: td.order,
              destination: {
                id: td.destination.id,
                name: td.destination.name,
                location: td.destination.location,
                coverImage: td.destination.coverImage,
                rating: td.destination.rating,
                reviewCount: td.destination.reviewCount,
                category: {
                  name: td.destination.category.name,
                  icon: td.destination.category.icon,
                },
              },
            }))}
          />
        )}

        {/* 底部：繼續探索連結 */}
        {trip.destinations.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-sm text-sky-600 hover:text-sky-700 font-medium"
            >
              <MapPin className="h-4 w-4" />
              繼續探索更多目的地
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
