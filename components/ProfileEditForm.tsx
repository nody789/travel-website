'use client'
// 'use client' 原因：
// 1. useState 管理表單狀態和 isOpen 開關
// 2. useSession 取得 update() 方法來重整 JWT（name/image 改變後讓 Navbar 顯示最新資料）

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ImageUpload from '@/components/admin/ImageUpload'
import { Pencil, X } from 'lucide-react'

interface ProfileEditFormProps {
  initialName: string
  initialImage: string | null
}

export default function ProfileEditForm({ initialName, initialImage }: ProfileEditFormProps) {
  const router = useRouter()
  // useSession 的 update()：觸發 auth.ts 的 jwt callback（trigger === 'update'），
  // 讓 JWT 重新從資料庫讀取最新 name/image，否則 Navbar 還是顯示舊的名稱
  const { update } = useSession()

  // isOpen 控制編輯表單的顯示/隱藏
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [image, setImage] = useState(initialImage ?? '')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setIsSaving(true)
    try {
      await axios.put('/api/profile', { name: name.trim(), image })

      // 重整 JWT：讓 next-auth 重新從 DB 讀取使用者資料，更新 session
      await update()

      // 重新渲染 Server Component，讓個人資料頁面顯示最新資料
      router.refresh()

      setIsOpen(false)
      toast.success('個人資料已更新')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '更新失敗')
      } else {
        toast.error('更新失敗，請稍後再試')
      }
    } finally {
      setIsSaving(false)
    }
  }

  // 收起狀態：顯示「編輯資料」按鈕
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Pencil className="h-4 w-4" />
        編輯資料
      </button>
    )
  }

  // 展開狀態：顯示編輯表單
  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-lg text-gray-900">編輯個人資料</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">顯示名稱 *</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入名稱（至少 2 個字）"
            minLength={2}
            required
          />
        </div>

        {/* ImageUpload 允許貼 URL 或上傳本地圖片（上傳後得到 Cloudinary URL） */}
        <ImageUpload
          value={image}
          onChange={setImage}
          label="頭像圖片"
        />

        <div className="flex gap-3 pt-1">
          <Button type="submit" disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
            {isSaving ? '儲存中...' : '儲存變更'}
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            取消
          </Button>
        </div>
      </form>
    </div>
  )
}
