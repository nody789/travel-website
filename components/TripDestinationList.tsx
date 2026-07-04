'use client'
// 'use client' 原因：需要 useState 管理本地列表（移除後即時更新）和 axios 呼叫 API

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, MapPin, Star, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface TripDest {
  tripDestId: string   // TripDestination.id（刪除時用）
  order: number
  destination: {
    id: string
    name: string
    location: string
    coverImage: string
    rating: number
    reviewCount: number
    category: { name: string; icon: string }
  }
}

interface TripDestinationListProps {
  tripId: string
  destinations: TripDest[]
}

export default function TripDestinationList({ tripId, destinations: initial }: TripDestinationListProps) {
  // 用本地 state 管理列表，移除後不需要重新取資料
  const [destinations, setDestinations] = useState(initial)
  const [removingId, setRemovingId] = useState<string | null>(null)

  async function handleRemove(tripDestId: string, name: string) {
    if (!confirm(`確定要將「${name}」從行程中移除嗎？`)) return

    setRemovingId(tripDestId)
    try {
      await axios.delete(`/api/trips/${tripId}/destinations/${tripDestId}`)
      setDestinations((prev) => prev.filter((d) => d.tripDestId !== tripDestId))
      toast.success(`已移除「${name}」`)
    } catch {
      toast.error('移除失敗，請稍後再試')
    } finally {
      setRemovingId(null)
    }
  }

  if (destinations.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
        行程中已無目的地
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {destinations.map((td, index) => (
        <div
          key={td.tripDestId}
          className="group flex items-center gap-4 rounded-2xl border bg-white p-4 hover:shadow-md transition-shadow"
        >
          {/* 序號 */}
          <div className="flex-shrink-0 flex items-center justify-center h-9 w-9 rounded-full bg-sky-50 text-sky-600 font-bold text-sm">
            {index + 1}
          </div>

          {/* 縮圖 */}
          <Link href={`/destinations/${td.destination.id}`} className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={td.destination.coverImage}
              alt={td.destination.name}
              className="h-20 w-28 rounded-xl object-cover bg-gray-100 group-hover:opacity-90 transition-opacity"
            />
          </Link>

          {/* 資訊 */}
          <div className="flex-1 min-w-0">
            <Link href={`/destinations/${td.destination.id}`}>
              <h3 className="font-semibold text-gray-900 hover:text-sky-600 transition-colors truncate">
                {td.destination.name}
              </h3>
            </Link>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{td.destination.location}</span>
              </span>
              <span className="flex-shrink-0">
                {td.destination.category.icon} {td.destination.category.name}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              {td.destination.rating > 0 ? (
                <>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= Math.round(td.destination.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-100'}`}
                    />
                  ))}
                  <span className="text-sm font-semibold text-gray-700 ml-1">
                    {td.destination.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">({td.destination.reviewCount})</span>
                </>
              ) : (
                <span className="text-xs text-gray-400">尚無評分</span>
              )}
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/destinations/${td.destination.id}`}
              className="p-2 rounded-lg text-gray-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              title="查看詳情"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
            <button
              onClick={() => handleRemove(td.tripDestId, td.destination.name)}
              disabled={removingId === td.tripDestId}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              title="從行程移除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
