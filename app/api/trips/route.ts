// app/api/trips/route.ts — 行程列表 API（GET 取得、POST 建立）

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1, '行程名稱為必填').max(50, '名稱最長 50 字'),
  description: z.string().max(200, '描述最長 200 字').optional(),
})

// GET /api/trips — 取得目前使用者的所有行程
// 回傳: trips with destination count + destinationId list（讓前端判斷某目的地是否已加入）
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: {
      destinations: {
        select: { id: true, destinationId: true, order: true },
        orderBy: { order: 'asc' },
      },
      _count: { select: { destinations: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ success: true, data: trips })
}

// POST /api/trips — 建立新行程
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = createSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.issues[0].message }, { status: 400 })
    }

    const trip = await prisma.trip.create({
      data: {
        userId: session.user.id,
        title: result.data.title,
        description: result.data.description,
      },
    })

    return NextResponse.json({ success: true, data: trip }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: '建立失敗' }, { status: 500 })
  }
}
