// components/DestinationCard.tsx — 目的地卡片（Server Component）
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'
import FavoriteButton from '@/components/FavoriteButton'
import type { DestinationSummary } from '@/types'

interface DestinationCardProps {
  destination: DestinationSummary
  favoriteId?: string
}

export default function DestinationCard({ destination, favoriteId }: DestinationCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* 圖片區域 */}
      <div className="relative h-52 overflow-hidden">
        <Link href={`/destinations/${destination.id}`}>
          <Image
            src={destination.coverImage}
            alt={destination.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* 漸層遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </Link>

        {/* 地點標籤（圖片左下角） */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-sm px-2.5 py-1">
          <MapPin className="h-3 w-3 text-white flex-shrink-0" />
          <span className="text-xs text-white font-medium truncate max-w-[120px]">
            {destination.location}
          </span>
        </div>

        {/* 收藏按鈕 */}
        <div className="absolute right-3 top-3">
          <FavoriteButton destinationId={destination.id} favoriteId={favoriteId} />
        </div>

        {/* 分類標籤（圖片左上角） */}
        <div className="absolute top-3 left-3">
          <span className="rounded-full bg-white/90 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-gray-700">
            {destination.category.icon} {destination.category.name}
          </span>
        </div>
      </div>

      {/* 卡片下方內容 */}
      <div className="p-4">
        <Link href={`/destinations/${destination.id}`}>
          <h3 className="font-semibold text-base text-gray-900 group-hover:text-sky-600 transition-colors leading-snug mb-2">
            {destination.name}
          </h3>
        </Link>

        {/* 評分列 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {destination.rating > 0 ? (
              <>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= Math.round(destination.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-100 text-gray-100'}`}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {destination.rating.toFixed(1)}
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">尚無評分</span>
            )}
          </div>
          {destination.reviewCount > 0 && (
            <span className="text-xs text-gray-400">{destination.reviewCount} 則評論</span>
          )}
        </div>
      </div>
    </div>
  )
}
