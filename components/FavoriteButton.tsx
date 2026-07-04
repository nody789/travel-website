'use client'
// 'use client' 原因：需要 useState（追蹤收藏狀態）、
// useSession（判斷是否登入）、以及呼叫 API（互動行為）

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface FavoriteButtonProps {
  destinationId: string
  // favoriteId：已收藏時傳入，用來執行刪除；undefined 表示尚未收藏
  favoriteId?: string
}

export default function FavoriteButton({ destinationId, favoriteId: initialFavoriteId }: FavoriteButtonProps) {
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

    // 未登入：導向登入頁
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (isLoading) return
    setIsLoading(true)

    // 先更新 UI（Optimistic Update）
    setIsFavorited((prev) => !prev)

    try {
      if (isFavorited && favoriteId) {
        // 已收藏 → 取消收藏
        await axios.delete(`/api/favorites/${favoriteId}`)
        setFavoriteId(undefined)
        toast.success('已取消收藏')
      } else {
        // 未收藏 → 加入收藏
        const res = await axios.post('/api/favorites', { destinationId })
        setFavoriteId(res.data.data.id)
        toast.success('已加入收藏')
      }
    } catch {
      // API 失敗 → 還原狀態
      setIsFavorited((prev) => !prev)
      toast.error('操作失敗，請稍後再試')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isFavorited ? '取消收藏' : '加入收藏'}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-60"
    >
      <Heart
        className="h-4 w-4 transition-colors"
        fill={isFavorited ? '#f97316' : 'none'}  // 收藏：橙色；未收藏：空心
        color={isFavorited ? '#f97316' : '#9ca3af'}
      />
    </button>
  )
}
