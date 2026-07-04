'use client'
// 'use client' 原因：表單有大量 state（每個欄位的值）和 API 呼叫

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Category, Destination } from '@/types'

interface DestinationFormProps {
  categories: Category[]
  // 有 destination 表示編輯模式，沒有表示新增模式
  destination?: Destination
}

export default function DestinationForm({ categories, destination }: DestinationFormProps) {
  const router = useRouter()
  const isEdit = !!destination

  const [form, setForm] = useState({
    name: destination?.name ?? '',
    slug: destination?.slug ?? '',
    description: destination?.description ?? '',
    location: destination?.location ?? '',
    coverImage: destination?.coverImage ?? '',
    categoryId: destination?.categoryId ?? '',
    isPublished: destination?.isPublished ?? false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 自動從名稱產生 slug：移除特殊符號、空格換成連字號、轉小寫
  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      // 只在新增模式時自動產生 slug，編輯時保留原 slug
      slug: isEdit ? prev.slug : name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-'),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isEdit) {
        await axios.patch(`/api/admin/destinations/${destination.id}`, form)
        toast.success('目的地已更新')
      } else {
        await axios.post('/api/admin/destinations', form)
        toast.success('目的地已新增')
      }
      router.push('/admin/destinations')
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '操作失敗，請稍後再試')
      } else {
        toast.error('操作失敗，請稍後再試')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* 名稱 */}
      <div className="space-y-1.5">
        <Label htmlFor="name">目的地名稱 *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="例：九份老街"
          required
        />
      </div>

      {/* Slug（自動產生，但可手動修改） */}
      <div className="space-y-1.5">
        <Label htmlFor="slug">
          Slug（URL 友善名稱）*
          <span className="ml-2 text-xs text-gray-400 font-normal">只能含小寫字母、數字、連字號</span>
        </Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          placeholder="例：jiufen"
          pattern="^[a-z0-9-]+$"
          required
        />
        <p className="text-xs text-gray-400">
          頁面網址將會是：/destinations/[id]
        </p>
      </div>

      {/* 分類下拉 */}
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">分類 *</Label>
        <select
          id="categoryId"
          value={form.categoryId}
          onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
        >
          <option value="">請選擇分類</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* 地點 */}
      <div className="space-y-1.5">
        <Label htmlFor="location">地點 *</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
          placeholder="例：台灣・新北市"
          required
        />
      </div>

      {/* 描述 */}
      <div className="space-y-1.5">
        <Label htmlFor="description">描述 *</Label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          rows={5}
          placeholder="詳細描述這個目的地..."
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
        />
      </div>

      {/* 封面圖片 URL */}
      <div className="space-y-1.5">
        <Label htmlFor="coverImage">封面圖片 URL *</Label>
        <Input
          id="coverImage"
          type="url"
          value={form.coverImage}
          onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
          placeholder="https://images.unsplash.com/..."
          required
        />
        {form.coverImage && (
          // 預覽圖片
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.coverImage}
            alt="預覽"
            className="mt-2 h-40 w-full object-cover rounded-lg border"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        )}
      </div>

      {/* 是否上架 */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isPublished"
          checked={form.isPublished}
          onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
        />
        <Label htmlFor="isPublished" className="cursor-pointer">
          立即上架
          <Badge
            variant={form.isPublished ? 'default' : 'secondary'}
            className="ml-2 text-xs"
          >
            {form.isPublished ? '上架中' : '草稿'}
          </Badge>
        </Label>
      </div>

      {/* 送出按鈕 */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-sky-600 hover:bg-sky-700"
        >
          {isSubmitting ? '儲存中...' : isEdit ? '更新目的地' : '新增目的地'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/destinations')}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
