'use client'
// 'use client' 原因：互動版需要 useState（追蹤 hover 和選取狀態）

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number            // 目前評分（1-5）
  onChange?: (rating: number) => void  // 有 onChange 就是互動版，沒有就是唯讀版
  readonly?: boolean       // 明確標示唯讀（等同於沒有 onChange）
  size?: 'sm' | 'md' | 'lg'
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  // hover：追蹤滑鼠停在第幾顆星星上（0 表示沒有 hover）
  const [hovered, setHovered] = useState(0)

  const isReadonly = readonly || !onChange

  const sizeClass = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size]

  // 決定第 i 顆星是否要亮起：hover 時看 hover 狀態，否則看 value
  const activeCount = isReadonly ? value : (hovered || value)

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        // 支援半星顯示（唯讀時）
        const isFull = star <= Math.floor(activeCount)
        const isHalf = !isFull && star === Math.ceil(activeCount) && activeCount % 1 >= 0.5

        return (
          <button
            key={star}
            type="button"
            disabled={isReadonly}
            onClick={() => !isReadonly && onChange?.(star)}
            onMouseEnter={() => !isReadonly && setHovered(star)}
            onMouseLeave={() => !isReadonly && setHovered(0)}
            className={cn(
              'relative',
              isReadonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'
            )}
            aria-label={`${star} 顆星`}
          >
            {/* 底層：空心星星（灰色） */}
            <Star className={cn(sizeClass, 'text-gray-300')} />
            {/* 上層：填色星星，用 clip 實現半星效果 */}
            <Star
              className={cn(
                sizeClass,
                'absolute inset-0 text-yellow-400 fill-yellow-400 transition-colors',
                isFull ? 'opacity-100' : isHalf ? 'opacity-100' : 'opacity-0'
              )}
              style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
            />
          </button>
        )
      })}
    </div>
  )
}
