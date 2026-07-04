// app/admin/categories/page.tsx — 分類管理（Server Component）

import { prisma } from '@/lib/prisma'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import AdminCategoryManager from '@/components/admin/AdminCategoryManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '分類管理' }

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { destinations: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="font-bold text-2xl text-gray-900 mb-8">分類管理</h1>

      {/* 新增分類表單（Client Component） */}
      <AdminCategoryManager categories={categories} />

      {/* 分類列表 */}
      <div className="mt-8 rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>分類名稱</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">目的地數量</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-xl">{cat.icon}</TableCell>
                <TableCell className="text-gray-500 text-sm font-mono">{cat.slug}</TableCell>
                <TableCell className="text-center text-sm">{cat._count.destinations}</TableCell>
                <TableCell className="text-right">
                  <AdminCategoryDeleteButton id={cat.id} name={cat.name} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {categories.length === 0 && (
          <div className="py-12 text-center text-gray-500">還沒有任何分類</div>
        )}
      </div>
    </div>
  )
}

// 這個小元件只是為了讓刪除按鈕在 Server Component 內使用
// 實際上 AdminCategoryManager 裡面已經有刪除邏輯
function AdminCategoryDeleteButton({ id, name }: { id: string; name: string }) {
  return <AdminCategoryDeleteButtonClient id={id} name={name} />
}

// 需要 import Client Component
import AdminCategoryDeleteButtonClient from '@/components/admin/AdminCategoryDeleteButton'
