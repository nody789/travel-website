'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus } from 'lucide-react'
import type { Category } from '@/types'

interface AdminCategoryManagerProps {
  categories: (Category & { _count: { destinations: number } })[]
}

export default function AdminCategoryManager({ categories: _ }: AdminCategoryManagerProps) {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', icon: '', slug: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-'),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await axios.post('/api/admin/categories', form)
      toast.success('分類已新增')
      setForm({ name: '', icon: '', slug: '' })
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '新增失敗')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="font-semibold text-lg text-gray-900 mb-4">新增分類</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="cat-name">分類名稱 *</Label>
          <Input
            id="cat-name"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="例：歷史古蹟"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-icon">Icon（emoji）*</Label>
          <Input
            id="cat-icon"
            value={form.icon}
            onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
            placeholder="🏛️"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cat-slug">Slug *</Label>
          <Input
            id="cat-slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            placeholder="historic"
            pattern="^[a-z0-9-]+$"
            required
          />
        </div>
        <div className="flex items-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-sky-600 hover:bg-sky-700 gap-2"
          >
            <Plus className="h-4 w-4" />
            {isSubmitting ? '新增中...' : '新增分類'}
          </Button>
        </div>
      </form>
    </div>
  )
}
