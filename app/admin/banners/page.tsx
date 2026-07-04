'use client'
// 'use client' 原因：需要 useState 管理表單、Modal 開關，以及 axios 呼叫 API
// 後台頁面通常用 Client Component 方便表單互動

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import axios from 'axios'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
  order: number
  isActive: boolean
  createdAt: string
}

const emptyForm = { title: '', subtitle: '', image: '', link: '', order: 0, isActive: true }

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  // useCallback 快取函式：避免每次 render 都產生新的函式引用，影響 useEffect dependency
  const fetchBanners = useCallback(async () => {
    try {
      const res = await axios.get<{ success: boolean; data: Banner[] }>('/api/admin/banners')
      setBanners(res.data.data)
    } catch {
      toast.error('載入失敗')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // useEffect dependency: [fetchBanners] — fetchBanners 用 useCallback 確保只在 mount 時跑一次
  useEffect(() => {
    fetchBanners()
  }, [fetchBanners])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(banner: Banner) {
    setEditingId(banner.id)
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      image: banner.image,
      link: banner.link ?? '',
      order: banner.order,
      isActive: banner.isActive,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title || !form.image) {
      toast.error('標題和圖片 URL 為必填')
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        ...form,
        subtitle: form.subtitle || undefined,
        link: form.link || undefined,
      }
      if (editingId) {
        await axios.put(`/api/admin/banners/${editingId}`, payload)
        toast.success('更新成功')
      } else {
        await axios.post('/api/admin/banners', payload)
        toast.success('新增成功')
      }
      setShowForm(false)
      fetchBanners()
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('操作失敗')
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggle(banner: Banner) {
    try {
      await axios.put(`/api/admin/banners/${banner.id}`, { isActive: !banner.isActive })
      toast.success(banner.isActive ? '已隱藏' : '已上架')
      fetchBanners()
    } catch {
      toast.error('操作失敗')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此 Banner 嗎？')) return
    try {
      await axios.delete(`/api/admin/banners/${id}`)
      toast.success('已刪除')
      fetchBanners()
    } catch {
      toast.error('刪除失敗')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">輪播 Banner 管理</h1>
          <p className="text-gray-500 text-sm mt-1">首頁輪播圖，依 order 數字由小到大排列</p>
        </div>
        <Button onClick={openCreate} className="bg-sky-600 hover:bg-sky-700 gap-1">
          <Plus className="h-4 w-4" />
          新增 Banner
        </Button>
      </div>

      {/* 新增/編輯表單 */}
      {showForm && (
        <div className="mb-6 rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-lg mb-4">{editingId ? '編輯 Banner' : '新增 Banner'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">標題 *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="例：探索亞洲最美目的地"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">副標題</label>
              <Input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="選填"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">圖片 URL *</label>
              <Input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">點擊連結</label>
              <Input
                value={form.link}
                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                placeholder="https://... （選填）"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排列順序</label>
              <Input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-sky-600"
              />
              立即上架顯示
            </label>
          </div>
          <div className="flex gap-3 mt-5">
            <Button onClick={handleSave} disabled={isSaving} className="bg-sky-600 hover:bg-sky-700">
              {isSaving ? '儲存中...' : '儲存'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              取消
            </Button>
          </div>
        </div>
      )}

      {/* Banner 列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-gray-400 rounded-xl border bg-white">
          尚無 Banner，點擊「新增 Banner」開始建立
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-xl border bg-white p-4 flex items-center gap-4 ${!banner.isActive ? 'opacity-60' : ''}`}
            >
              <GripVertical className="h-5 w-5 text-gray-300 flex-shrink-0" />
              {/* Next.js <Image> 取代 <img>：自動 lazy loading、WebP 轉換、尺寸最佳化 */}
              <div className="relative h-16 w-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{banner.title}</p>
                {banner.subtitle && (
                  <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">排序：{banner.order}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(banner)}
                  title={banner.isActive ? '點擊隱藏' : '點擊上架'}
                  className="text-gray-400 hover:text-sky-600 transition-colors"
                >
                  {banner.isActive ? (
                    <ToggleRight className="h-6 w-6 text-sky-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(banner)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
