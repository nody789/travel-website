// app/events/page.tsx — 活動列表頁（Server Component）
// Server Component 好處：活動資料直接在 server 端抓取，SEO 友好

import { prisma } from '@/lib/prisma'
import { CalendarDays, MapPin, Clock } from 'lucide-react'
import Image from 'next/image'
import dayjs from 'dayjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '近期活動 | Travel Explorer',
  description: '探索最新旅遊活動與事件，不錯過任何精彩體驗',
}

export default async function EventsPage() {
  // Server Component 直接用 prisma 取資料，不需要 useEffect 或 axios
  const [upcomingEvents, pastEvents] = await Promise.all([
    // 未來 + 進行中的活動
    prisma.event.findMany({
      where: { isActive: true, endDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
    }),
    // 已結束的活動（最近 3 個）
    prisma.event.findMany({
      where: { isActive: true, endDate: { lt: new Date() } },
      orderBy: { endDate: 'desc' },
      take: 3,
    }),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-bold text-3xl text-gray-900">活動與事件</h1>
        <p className="text-gray-500 mt-1">探索最新旅遊活動，豐富你的旅行體驗</p>
      </div>

      {/* 近期/進行中活動 */}
      {upcomingEvents.length === 0 ? (
        <div className="py-16 text-center rounded-xl border bg-white">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">目前沒有近期活動</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => {
            const isOngoing =
              new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date()

            return (
              <article
                key={event.id}
                className="rounded-xl border bg-white overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* 封面圖 */}
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* 進行中的活動顯示標籤 */}
                  {isOngoing && (
                    <span className="absolute top-3 left-3 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                      進行中
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2">
                    {event.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                  <div className="space-y-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 flex-shrink-0 text-sky-500" />
                      <span>
                        {dayjs(event.startDate).format('YYYY/MM/DD')} –{' '}
                        {dayjs(event.endDate).format('YYYY/MM/DD')}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-sky-500" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0 text-sky-500" />
                      <span>
                        距結束還有 {Math.max(0, dayjs(event.endDate).diff(dayjs(), 'day'))} 天
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* 已結束活動 */}
      {pastEvents.length > 0 && (
        <div className="mt-12">
          <h2 className="font-bold text-xl text-gray-900 mb-6">已結束活動</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border bg-white overflow-hidden opacity-70"
              >
                <div className="relative h-36 bg-gray-100">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover grayscale"
                    unoptimized
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-gray-500 px-3 py-1 text-xs font-medium text-white">
                    已結束
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-700 mb-1 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-gray-400">
                    {dayjs(event.startDate).format('YYYY/MM/DD')} –{' '}
                    {dayjs(event.endDate).format('YYYY/MM/DD')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
