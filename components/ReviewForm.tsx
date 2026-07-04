'use client'
// 'use client' 原因：需要 useState（表單狀態、評分選取）和呼叫 API

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import StarRating from '@/components/StarRating'
import { Button } from '@/components/ui/button'

interface ReviewFormProps {
  destinationId: string
}

export default function ReviewForm({ destinationId }: ReviewFormProps) {
  // rating：使用者選取的星星數（初始 0 = 尚未選取）
  const [rating, setRating] = useState(0)
  // comment：評論文字內容
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (rating === 0) {
      toast.error('請選擇評分')
      return
    }
    if (comment.trim().length === 0) {
      toast.error('請輸入評論內容')
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post(`/api/destinations/${destinationId}/reviews`, {
        rating,
        comment: comment.trim(),
      })
      toast.success('評論已送出，等待管理員審核後顯示')
      setRating(0)
      setComment('')
      // router.refresh()：重新取得 Server Component 的資料，但不重新整理整頁
      // 這是 Next.js App Router 特有的做法，取代傳統的 window.location.reload()
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '送出失敗，請稍後再試')
      } else {
        toast.error('送出失敗，請稍後再試')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 space-y-4">
      <h3 className="font-semibold text-lg text-gray-900">撰寫評論</h3>

      {/* 星星評分選取 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">評分</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      {/* 評論內容 */}
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          評論內容
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder="分享你的旅遊體驗..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{comment.length}/1000</p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-sky-600 hover:bg-sky-700"
      >
        {isSubmitting ? '送出中...' : '送出評論'}
      </Button>
    </form>
  )
}
