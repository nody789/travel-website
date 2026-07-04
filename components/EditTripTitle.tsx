'use client'
// 'use client' 原因：需要 useState 管理編輯模式 + axios 呼叫 API 更新標題

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface EditTripTitleProps {
  tripId: string
  initialTitle: string
  initialDescription: string
}

export default function EditTripTitle({ tripId, initialTitle, initialDescription }: EditTripTitleProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setIsSaving(true)
    try {
      await axios.put(`/api/trips/${tripId}`, {
        title: title.trim(),
        description: description.trim() || null,
      })
      toast.success('行程已更新')
      setIsEditing(false)
      // 重新渲染 Server Component 顯示最新標題
      router.refresh()
    } catch {
      toast.error('更新失敗')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="flex-shrink-0 rounded-lg p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        title="編輯行程名稱"
      >
        <Pencil className="h-5 w-5" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditing(false)} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="font-bold text-lg text-gray-900 mb-4">編輯行程資訊</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">行程名稱 *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              maxLength={50}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述（選填）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              maxLength={200}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSave}
            disabled={!title.trim() || isSaving}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {isSaving ? '儲存中...' : '儲存'}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="rounded-xl border px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
