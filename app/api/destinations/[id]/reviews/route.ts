// app/api/destinations/[id]/reviews/route.ts
//
// GET /api/destinations/:id/reviews — 公開，取得已審核的評論
// POST /api/destinations/:id/reviews — 需登入，新增評論

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Zod 驗證 schema：確保 rating 是 1-5 的整數、comment 不為空
const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1, '評論內容不能為空').max(1000),
})

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const reviews = await prisma.review.findMany({
      where: {
        destinationId: id,
        isApproved: true, // 只顯示審核通過的評論
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // 驗證登入狀態
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const { id: destinationId } = await params

    // 確認目的地存在
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId, isPublished: true },
    })
    if (!destination) {
      return NextResponse.json(
        { success: false, message: '目的地不存在' },
        { status: 404 }
      )
    }

    // Zod 驗證請求 body
    const body = await request.json()
    const result = createReviewSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { rating, comment } = result.data

    // 同一使用者對同一目的地只能留一則評論（schema 有 @@unique）
    const existing = await prisma.review.findUnique({
      where: {
        userId_destinationId: {
          userId: session.user.id,
          destinationId,
        },
      },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: '你已經評論過這個目的地了' },
        { status: 409 }
      )
    }

    // 建立評論（isApproved 預設 false，等管理員審核）
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        destinationId,
        rating,
        comment,
      },
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
