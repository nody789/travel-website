// app/admin/destinations/page.tsx — 後台目的地管理列表（Server Component）

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus } from 'lucide-react'
import AdminDestinationActions from '@/components/admin/AdminDestinationActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '目的地管理' }

export default async function AdminDestinationsPage() {
  const destinations = await prisma.destination.findMany({
    include: {
      category: { select: { name: true, icon: true } },
      _count: { select: { reviews: true, favorites: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-bold text-2xl text-gray-900">目的地管理</h1>
        <Button asChild className="bg-sky-600 hover:bg-sky-700 gap-2">
          <Link href="/admin/destinations/new">
            <Plus className="h-4 w-4" />
            新增目的地
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>名稱</TableHead>
              <TableHead>分類</TableHead>
              <TableHead>地點</TableHead>
              <TableHead className="text-center">評論</TableHead>
              <TableHead className="text-center">收藏</TableHead>
              <TableHead className="text-center">狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {destinations.map((dest) => (
              <TableRow key={dest.id}>
                <TableCell className="font-medium">{dest.name}</TableCell>
                <TableCell>
                  {dest.category.icon} {dest.category.name}
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{dest.location}</TableCell>
                <TableCell className="text-center text-sm">{dest._count.reviews}</TableCell>
                <TableCell className="text-center text-sm">{dest._count.favorites}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={dest.isPublished ? 'default' : 'secondary'}>
                    {dest.isPublished ? '✅ 上架' : '⬜ 草稿'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {/* AdminDestinationActions 是 Client Component（有刪除按鈕的互動） */}
                  <AdminDestinationActions id={dest.id} name={dest.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {destinations.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <p>還沒有任何目的地</p>
          </div>
        )}
      </div>
    </div>
  )
}
