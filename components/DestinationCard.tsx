// components/DestinationCard.tsx — Server Component（不需要互動，純顯示）
// 例外：右上角的 FavoriteButton 是 Client Component，被包在這裡使用
// Next.js 允許 Server Component 內嵌 Client Component，但反過來不行

import Image from 'next/image'
// 用 Next.js <Image> 而不是 <img>：自動 WebP 轉換、lazy loading、避免 CLS（版面位移）

import Link from 'next/link'
// 用 Next.js <Link> 而不是 <a>：SPA 導頁（不重新載入整頁）、自動 prefetch

import { MapPin, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import FavoriteButton from '@/components/FavoriteButton'
import type { DestinationSummary } from '@/types'

interface DestinationCardProps {
  destination: DestinationSummary
  // favoriteId：如果目前使用者已收藏，傳入 favorite 的 id 方便刪除
  // undefined 表示尚未收藏
  favoriteId?: string
}

export default function DestinationCard({ destination, favoriteId }: DestinationCardProps) {
  return (
    // group：配合 group-hover 讓子元素可以感知父元素的 hover 狀態
    <div className="group relative overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition-shadow duration-200">
      {/* 圖片區域 — 16:9 比例 */}
      <div className="relative aspect-video overflow-hidden">
        <Link href={`/destinations/${destination.id}`}>
          <Image
            src={destination.coverImage}
            alt={destination.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        {/* 收藏按鈕：右上角，絕對定位 */}
        <div className="absolute right-2 top-2">
          <FavoriteButton destinationId={destination.id} favoriteId={favoriteId} />
        </div>
      </div>

      {/* 卡片內容 */}
      <div className="p-4 space-y-2">
        {/* 分類 Badge */}
        <Badge variant="secondary" className="text-xs">
          {destination.category.icon} {destination.category.name}
        </Badge>

        {/* 目的地名稱 */}
        <Link href={`/destinations/${destination.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 hover:text-sky-600 transition-colors leading-tight">
            {destination.name}
          </h3>
        </Link>

        {/* 地點 */}
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{destination.location}</span>
        </div>

        {/* 評分 + 評論數 */}
        <div className="flex items-center gap-1.5 text-sm">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-gray-900">
            {destination.rating > 0 ? destination.rating.toFixed(1) : '尚無評分'}
          </span>
          {destination.reviewCount > 0 && (
            <span className="text-gray-500">({destination.reviewCount} 則評論)</span>
          )}
        </div>
      </div>
    </div>
  )
}
