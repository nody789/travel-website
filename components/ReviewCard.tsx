// components/ReviewCard.tsx — 評論卡片（Server Component）

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import dayjs from 'dayjs'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.user.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="rounded-2xl border bg-white p-5 space-y-3 hover:shadow-sm transition-shadow">
      {/* 使用者頭像 + 名稱 + 日期 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user.image ?? ''} alt={review.user.name ?? ''} />
            <AvatarFallback className="bg-sky-100 text-sky-700 text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">
              {review.user.name ?? '匿名旅客'}
            </p>
            {/* dayjs 格式化日期，比原生 Date 簡潔 */}
            <p className="text-xs text-gray-400 mt-0.5">
              {dayjs(review.createdAt).format('YYYY 年 M 月 D 日')}
            </p>
          </div>
        </div>

        {/* 星星評分（右邊顯示） */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`h-3.5 w-3.5 ${
                s <= review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-100 text-gray-100'
              }`}
            />
          ))}
          <span className="ml-1.5 text-sm font-semibold text-gray-700">{review.rating}.0</span>
        </div>
      </div>

      {/* 評論內容 */}
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </div>
  )
}
