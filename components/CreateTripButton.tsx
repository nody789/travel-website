'use client'
// 'use client' 原因：需要 useState 管理 modal 開關、axios 呼叫 API 建立行程

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CreateTripButtonProps {
  // variant: default（小按鈕）| big（空狀態用的大按鈕）
  variant?: 'default' | 'big'
}

export default function CreateTripButton({ variant = 'default' }: CreateTripButtonProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    setIsCreating(true)
    try {
      await axios.post('/api/trips', { title: title.trim(), description: description.trim() || undefined })
      toast.success(`行程「${title}」已建立`)
      setIsOpen(false)
      setTitle('')
      setDescription('')
      // 重新渲染 Server Component，顯示最新行程列表
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '建立失敗')
      } else {
        toast.error('建立失敗')
      }
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {/* 觸發按鈕 */}
      {variant === 'big' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          建立第一個行程
        </button>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-sky-600 hover:bg-sky-700 gap-1.5"
        >
          <Plus className="h-4 w-4" />
          建立行程
        </Button>
      )}

      {/* 簡單 Modal（不依賴第三方 dialog） */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          {/* Modal 內容 */}
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-xl text-gray-900">建立新行程</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="trip-title">行程名稱 *</Label>
                <Input
                  id="trip-title"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例：2026 日本十日遊"
                  maxLength={50}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trip-desc">描述（選填）</Label>
                <textarea
                  id="trip-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="簡短描述這個行程..."
                  rows={3}
                  maxLength={200}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={!title.trim() || isCreating}
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                >
                  {isCreating ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />建立中...</>
                  ) : (
                    '建立行程'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
