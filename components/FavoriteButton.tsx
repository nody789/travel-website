'use client'
// 'use client' 原因：需要 useState（樂觀更新收藏狀態）、
// useSession（判斷是否登入）、以及呼叫 API（互動行為）

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface FavoriteButtonProps {
  destinationId: string
  favoriteId?: string
  // variant:
  //   icon（預設）— 圓形小按鈕（用於卡片、Hero 圖右上角）
  //   full — 完整按鈕，有文字（用於 sidebar）
  variant?: 'icon' | 'full'
}

export default function FavoriteButton({
  destinationId,
  favoriteId: initialFavoriteId,
  variant = 'icon',
}: FavoriteButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  // Optimistic Update（樂觀更新）：
  // 點擊後立即更新 UI，不等 API 回傳，讓使用者感覺更流暢
  // 如果 API 失敗，再把狀態改回來
  const [isFavorited, setIsFavorited] = useState(!!initialFavoriteId)
  const [favoriteId, setFavoriteId] = useState<string | undefined>(initialFavoriteId)
  const [isLoading, setIsLoading] = useState(false)

  async function handleToggle(e: React.MouseEvent) {
    // 阻止事件冒泡，避免點擊收藏按鈕時同時觸發卡片的連結跳轉
    e.preventDefault()
    e.stopPropagation()

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (isLoading) return
    setIsLoading(true)
    setIsFavorited((prev) => !prev)

    try {
      if (isFavorited && favoriteId) {
        await axios.delete(`/api/favorites/${favoriteId}`)
        setFavoriteId(undefined)
        toast.success('已取消收藏')
      } else {
        const res = await axios.post('/api/favorites', { destinationId })
        setFavoriteId(res.data.data.id)
        toast.success('已加入收藏')
      }
    } catch {
      setIsFavorited((prev) => !prev)
      toast.error('操作失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  // icon variant：圓形小按鈕（卡片用）
  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={isFavorited ? '取消收藏' : '加入收藏'}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-60"
      >
        <Heart
          className="h-4 w-4 transition-colors"
          fill={isFavorited ? '#f97316' : 'none'}
          color={isFavorited ? '#f97316' : '#9ca3af'}
        />
      </button>
    )
  }

  // full variant：完整按鈕（sidebar 用）
  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
        isFavorited
          ? 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'
          : 'bg-gray-900 text-white hover:bg-gray-800'
      } disabled:opacity-60`}
    >
      <Heart
        className="h-4 w-4 transition-colors"
        fill={isFavorited ? '#f97316' : 'none'}
        color={isFavorited ? '#f97316' : 'white'}
      />
      {isFavorited ? '已加入收藏' : '加入收藏'}
    </button>
  )
}
