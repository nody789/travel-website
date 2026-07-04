'use client'
// useFavorites — 封裝收藏功能的 custom hook
//
// 為什麼封裝成 hook？
// 如果多個元件都需要收藏功能（例如：詳情頁、收藏頁），
// 把邏輯集中在 hook 裡，不用每個元件重複寫相同的 API 呼叫邏輯。
//
// 使用時機：
// 當需要在 Client Component 裡管理多個目的地的收藏狀態（例如：收藏清單頁）
// 如果只是單一按鈕，直接用 FavoriteButton 元件就夠了

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import axios from 'axios'

interface FavoriteItem {
  favoriteId: string
  destinationId: string
}

interface UseFavoritesReturn {
  favorites: FavoriteItem[]
  isFavorited: (destinationId: string) => boolean
  addFavorite: (destinationId: string) => Promise<void>
  removeFavorite: (destinationId: string) => Promise<void>
  isLoading: boolean
}

export function useFavorites(initialFavorites: FavoriteItem[] = []): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(initialFavorites)
  const [isLoading, setIsLoading] = useState(false)

  // useCallback：這兩個函式每次 render 會重新建立，但邏輯不變
  // 用 useCallback 避免把不必要的新函式傳給子元件造成 re-render
  const isFavorited = useCallback(
    (destinationId: string) => favorites.some((f) => f.destinationId === destinationId),
    [favorites]
  )

  const addFavorite = useCallback(async (destinationId: string) => {
    setIsLoading(true)
    try {
      const res = await axios.post('/api/favorites', { destinationId })
      const newFavorite: FavoriteItem = {
        favoriteId: res.data.data.id,
        destinationId,
      }
      // 用 setState 的 callback 形式，確保拿到最新的 state（避免 closure 問題）
      setFavorites((prev) => [...prev, newFavorite])
      toast.success('已加入收藏')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '加入收藏失敗')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFavorite = useCallback(async (destinationId: string) => {
    const favorite = favorites.find((f) => f.destinationId === destinationId)
    if (!favorite) return

    setIsLoading(true)
    try {
      await axios.delete(`/api/favorites/${favorite.favoriteId}`)
      setFavorites((prev) => prev.filter((f) => f.destinationId !== destinationId))
      toast.success('已取消收藏')
    } catch {
      toast.error('取消收藏失敗')
    } finally {
      setIsLoading(false)
    }
  }, [favorites])

  return { favorites, isFavorited, addFavorite, removeFavorite, isLoading }
}
