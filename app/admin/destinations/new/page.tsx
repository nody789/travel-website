// app/admin/destinations/new/page.tsx — 新增目的地（Server Component）
// 在 server 取得分類列表，再傳給 Client Component 表單

import { prisma } from '@/lib/prisma'
import DestinationForm from '@/components/admin/DestinationForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '新增目的地' }

export default async function NewDestinationPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="font-bold text-2xl text-gray-900 mb-8">新增目的地</h1>
      <div className="rounded-xl border bg-white p-8">
        <DestinationForm categories={categories} />
      </div>
    </div>
  )
}
