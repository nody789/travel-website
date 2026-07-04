// app/api/admin/reviews/[id]/route.ts
//
// GET    /api/admin/reviews      — 取得所有評論（含待審核）
// PATCH  /api/admin/reviews/:id  — 審核通過或駁回
// DELETE /api/admin/reviews/:id  — 刪除評論

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function requireAdmin() {
  const session = await auth()
  if (!session) return { error: '請先登入', status: 401 }
  if (session.user.role !== 'ADMIN') return { error: '無權限', status: 403 }
  return { session, error: null, status: 200 }
}

const approveReviewSchema = z.object({
  isApproved: z.boolean(),
})

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status })
  }

  try {
    const { id } = await params

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json(
        { success: false, message: '評論不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = approveReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: '請提供審核狀態' },
        { status: 400 }
      )
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { isApproved: result.data.isApproved },
    })

    // 審核通過後更新目的地的評分快取
    if (result.data.isApproved) {
      await updateDestinationStats(review.destinationId)
    }

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status })
  }

  try {
    const { id } = await params

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json(
        { success: false, message: '評論不存在' },
        { status: 404 }
      )
    }

    await prisma.review.delete({ where: { id } })
    await updateDestinationStats(review.destinationId)

    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

async function updateDestinationStats(destinationId: string) {
  const stats = await prisma.review.aggregate({
    where: { destinationId, isApproved: true },
    _avg: { rating: true },
    _count: { id: true },
  })

  await prisma.destination.update({
    where: { id: destinationId },
    data: {
      rating: stats._avg.rating ?? 0,
      reviewCount: stats._count.id,
    },
  })
}
