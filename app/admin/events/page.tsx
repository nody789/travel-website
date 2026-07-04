'use client'
// 'use client' 原因：表單 useState 和 axios API 呼叫需要 Client Component

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import axios from 'axios'
import Image from 'next/image'
import dayjs from 'dayjs'

interface Event {
  id: string
  title: string
  description: string
  image: string
  startDate: string
  endDate: string
  location: string | null
  isActive: boolean
  createdAt: string
}

const emptyForm = {
  title: '',
  description: '',
  image: '',
  startDate: '',
  endDate: '',
  location: '',
  isActive: true,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [isSaving, setIsSaving] = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get<{ success: boolean; data: Event[] }>('/api/admin/events')
      setEvents(res.data.data)
    } catch {
      toast.error('載入失敗')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(event: Event) {
    setEditingId(event.id)
    setForm({
      title: event.title,
      description: event.description,
      image: event.image,
      // dayjs 格式化為 datetime-local input 格式（YYYY-MM-DDTHH:mm）
      startDate: dayjs(event.startDate).format('YYYY-MM-DDTHH:mm'),
      endDate: dayjs(event.endDate).format('YYYY-MM-DDTHH:mm'),
      location: event.location ?? '',
      isActive: event.isActive,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.title || !form.image || !form.startDate || !form.endDate) {
      toast.error('標題、圖片、開始/結束日期為必填')
      return
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error('結束日期必須在開始日期之後')
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        ...form,
        // ISO 8601 格式讓後端 Zod 能驗證
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        location: form.location || undefined,
      }
      if (editingId) {
        await axios.put(`/api/admin/events/${editingId}`, payload)
        toast.success('更新成功')
      } else {
        await axios.post('/api/admin/events', payload)
        toast.success('新增成功')
      }
      setShowForm(false)
      fetchEvents()
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

  async function handleToggle(event: Event) {
    try {
      await axios.put(`/api/admin/events/${event.id}`, { isActive: !event.isActive })
      toast.success(event.isActive ? '已隱藏' : '已上架')
      fetchEvents()
    } catch {
      toast.error('操作失敗')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除此活動嗎？')) return
    try {
      await axios.delete(`/api/admin/events/${id}`)
      toast.success('已刪除')
      fetchEvents()
    } catch {
      toast.error('刪除失敗')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">活動/事件管理</h1>
          <p className="text-gray-500 text-sm mt-1">管理首頁「近期活動」區塊及活動列表頁</p>
        </div>
        <Button onClick={openCreate} className="bg-sky-600 hover:bg-sky-700 gap-1">
          <Plus className="h-4 w-4" />
          新增活動
        </Button>
      </div>

      {/* 新增/編輯表單 */}
      {showForm && (
        <div className="mb-6 rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-lg mb-4">{editingId ? '編輯活動' : '新增活動'}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">活動標題 *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="例：2026 亞洲美食節"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">活動描述 *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="活動詳細介紹..."
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">封面圖片 URL *</label>
              <Input
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始時間 *</label>
              <Input
                type="datetime-local"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">結束時間 *</label>
              <Input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">活動地點</label>
              <Input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="例：台北市信義區（選填）"
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

      {/* 活動列表 */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400 rounded-xl border bg-white">
          尚無活動，點擊「新增活動」開始建立
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`rounded-xl border bg-white p-4 flex items-center gap-4 ${!event.isActive ? 'opacity-60' : ''}`}
            >
              <div className="relative h-16 w-28 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{event.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  <Calendar className="h-3 w-3" />
                  {dayjs(event.startDate).format('YYYY/MM/DD')} –{' '}
                  {dayjs(event.endDate).format('YYYY/MM/DD')}
                  {event.location && <span>・{event.location}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(event)}
                  title={event.isActive ? '點擊隱藏' : '點擊上架'}
                  className="text-gray-400 hover:text-sky-600 transition-colors"
                >
                  {event.isActive ? (
                    <ToggleRight className="h-6 w-6 text-sky-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(event)}
                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
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
