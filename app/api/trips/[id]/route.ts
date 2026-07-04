// app/api/trips/[id]/route.ts — 單一行程 API（GET 詳情、PUT 更新、DELETE 刪除）

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1, '名稱為必填').max(50).optional(),
  description: z.string().max(200).optional().nullable(),
})

// GET /api/trips/[id] — 取得行程詳情，含完整目的地資訊
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      destinations: {
        include: {
          destination: {
            include: { category: true },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ success: false, message: '行程不存在' }, { status: 404 })
  }

  return NextResponse.json({ success: true, data: trip })
}

// PUT /api/trips/[id] — 更新行程標題/描述
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ success: false, message: '行程不存在' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const result = updateSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.issues[0].message }, { status: 400 })
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, message: '更新失敗' }, { status: 500 })
  }
}

// DELETE /api/trips/[id] — 刪除行程（連同 TripDestination 一起 Cascade 刪除）
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  const { id } = await params

  const trip = await prisma.trip.findUnique({ where: { id } })
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ success: false, message: '行程不存在' }, { status: 404 })
  }

  await prisma.trip.delete({ where: { id } })

  return NextResponse.json({ success: true, data: null })
}
