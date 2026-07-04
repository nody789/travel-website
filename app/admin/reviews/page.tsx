// app/admin/reviews/page.tsx — 評論審核（Server Component）

import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import dayjs from 'dayjs'
import AdminReviewActions from '@/components/admin/AdminReviewActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '評論審核' }

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      destination: { select: { name: true } },
    },
    orderBy: [
      { isApproved: 'asc' }, // 待審核排前面
      { createdAt: 'desc' },
    ],
  })

  const pendingCount = reviews.filter((r) => !r.isApproved).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-bold text-2xl text-gray-900">
          評論審核
          {pendingCount > 0 && (
            <span className="ml-3 rounded-full bg-orange-100 px-3 py-1 text-base font-normal text-orange-600">
              {pendingCount} 則待審核
            </span>
          )}
        </h1>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>目的地</TableHead>
              <TableHead>使用者</TableHead>
              <TableHead className="text-center">評分</TableHead>
              <TableHead>評論內容</TableHead>
              <TableHead>日期</TableHead>
              <TableHead className="text-center">狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} className={!review.isApproved ? 'bg-orange-50/50' : ''}>
                <TableCell className="font-medium text-sm">
                  {review.destination.name}
                </TableCell>
                <TableCell className="text-sm">
                  <div>{review.user.name ?? '—'}</div>
                  <div className="text-gray-400 text-xs">{review.user.email}</div>
                </TableCell>
                <TableCell className="text-center">
                  {'⭐'.repeat(review.rating)}
                </TableCell>
                <TableCell className="max-w-xs">
                  <p className="text-sm text-gray-700 truncate">{review.comment}</p>
                </TableCell>
                <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                  {dayjs(review.createdAt).format('MM/DD HH:mm')}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                    {review.isApproved ? '✅ 已通過' : '⏳ 待審核'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AdminReviewActions
                    id={review.id}
                    isApproved={review.isApproved}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {reviews.length === 0 && (
          <div className="py-16 text-center text-gray-500">沒有任何評論</div>
        )}
      </div>
    </div>
  )
}
