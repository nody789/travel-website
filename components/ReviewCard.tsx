// components/ReviewCard.tsx — Server Component（純顯示，不需要互動）

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import StarRating from '@/components/StarRating'
import dayjs from 'dayjs'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.user.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      {/* 使用者資訊 + 日期 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={review.user.image ?? ''} alt={review.user.name ?? ''} />
            <AvatarFallback className="bg-sky-100 text-sky-700 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-900 text-sm">
            {review.user.name ?? '匿名使用者'}
          </span>
        </div>
        {/* dayjs 格式化日期，比原生 Date 簡單很多 */}
        <span className="text-xs text-gray-400">
          {dayjs(review.createdAt).format('YYYY-MM-DD')}
        </span>
      </div>

      {/* 星星評分 */}
      <StarRating value={review.rating} readonly size="sm" />

      {/* 評論內容 */}
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
    </div>
  )
}
