// app/trips/page.tsx — 我的行程列表（Server Component）
// 由 proxy.ts 保護，需要登入才能存取

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Route, Plus, MapPin, Calendar } from 'lucide-react'
import CreateTripButton from '@/components/CreateTripButton'
import dayjs from 'dayjs'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '我的行程' }

export default async function TripsPage() {
  const session = await auth()

  const trips = await prisma.trip.findMany({
    where: { userId: session!.user.id },
    include: {
      destinations: {
        include: {
          destination: {
            select: { id: true, name: true, coverImage: true, location: true },
          },
        },
        orderBy: { order: 'asc' },
        take: 4, // 只取前 4 個，用來顯示縮圖
      },
      _count: { select: { destinations: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* 頁頭 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Route className="h-6 w-6 text-sky-600" />
            <h1 className="font-bold text-3xl text-gray-900">我的行程</h1>
          </div>
          <p className="text-gray-500 text-sm">規劃你的旅遊行程，將心儀的目的地加入清單</p>
        </div>
        {/* 建立行程按鈕（Client Component，需要 useState 管理 modal） */}
        <CreateTripButton />
      </div>

      {/* 空狀態 */}
      {trips.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <Route className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <h3 className="font-semibold text-gray-700 mb-1">還沒有行程</h3>
          <p className="text-sm text-gray-400 mb-6">
            建立你的第一個行程，把喜歡的目的地加進來吧
          </p>
          <CreateTripButton variant="big" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {trips.map((trip) => {
            // 取第一個目的地的圖片當封面（若沒有則用 placeholder）
            const coverDest = trip.destinations[0]?.destination
            const extraCount = trip._count.destinations - 4

            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="group rounded-2xl border bg-white hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* 縮圖格線 */}
                {trip.destinations.length > 0 ? (
                  <div className={`grid gap-0.5 h-44 ${trip.destinations.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {trip.destinations.slice(0, 4).map((td, idx) => (
                      <div key={td.id} className="relative overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={td.destination.coverImage}
                          alt={td.destination.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* 最後一格且有更多 → 顯示 +N */}
                        {idx === 3 && extraCount > 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">+{extraCount}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-44 bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center">
                    <Route className="h-12 w-12 text-sky-300" />
                  </div>
                )}

                {/* 行程資訊 */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-sky-600 transition-colors mb-1.5 truncate">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {trip._count.destinations} 個目的地
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {dayjs(trip.updatedAt).format('YYYY/MM/DD')}
                    </span>
                  </div>
                  {trip.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{trip.description}</p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
