// app/admin/destinations/[id]/edit/page.tsx — 編輯目的地（Server Component）
//
// 動態路由 [id]：從 URL 取得要編輯的目的地 id
// 在 server 端同時取得目的地資料和分類列表，傳給 DestinationForm

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import DestinationForm from '@/components/admin/DestinationForm'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: '編輯目的地' }

export default async function EditDestinationPage({ params }: PageProps) {
  const { id } = await params

  const [destination, categories] = await Promise.all([
    prisma.destination.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!destination) notFound()

  return (
    <div>
      <h1 className="font-bold text-2xl text-gray-900 mb-8">
        編輯：{destination.name}
      </h1>
      <div className="rounded-xl border bg-white p-8">
        <DestinationForm categories={categories} destination={destination} />
      </div>
    </div>
  )
}
