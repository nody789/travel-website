// app/api/reviews/[id]/route.ts
//
// PATCH /api/reviews/:id — 修改自己的評論（本人）
// DELETE /api/reviews/:id — 刪除評論（本人或 ADMIN）

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(1000).optional(),
})

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const { id } = await params

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json(
        { success: false, message: '評論不存在' },
        { status: 404 }
      )
    }

    // 只有本人可以修改
    if (review.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: '無權限' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const result = updateReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    // 修改評論後重設為待審核
    const updated = await prisma.review.update({
      where: { id },
      data: { ...result.data, isApproved: false },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const { id } = await params

    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) {
      return NextResponse.json(
        { success: false, message: '評論不存在' },
        { status: 404 }
      )
    }

    // 本人或 ADMIN 才能刪除
    const isOwner = review.userId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, message: '無權限' },
        { status: 403 }
      )
    }

    await prisma.review.delete({ where: { id } })

    // 刪除評論後更新目的地的快取評分和評論數
    await updateDestinationStats(review.destinationId)

    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

// 重新計算並更新目的地的平均評分和評論數
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
