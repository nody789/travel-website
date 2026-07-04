// app/api/trips/[id]/destinations/route.ts — 將目的地加入行程（POST）

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addSchema = z.object({
  destinationId: z.string().min(1),
})

// POST /api/trips/[id]/destinations — 將目的地加入行程
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  const { id: tripId } = await params

  // 確認行程存在且屬於目前使用者
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ success: false, message: '行程不存在' }, { status: 404 })
  }

  try {
    const body = await req.json()
    const result = addSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error.issues[0].message }, { status: 400 })
    }

    const { destinationId } = result.data

    // 確認目的地存在
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId, isPublished: true },
    })
    if (!destination) {
      return NextResponse.json({ success: false, message: '目的地不存在' }, { status: 404 })
    }

    // 計算目前行程中的最大 order（新加入的排在最後）
    const maxOrder = await prisma.tripDestination.aggregate({
      where: { tripId },
      _max: { order: true },
    })

    const tripDest = await prisma.tripDestination.create({
      data: {
        tripId,
        destinationId,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    })

    // 同步更新行程的 updatedAt
    await prisma.trip.update({ where: { id: tripId }, data: { updatedAt: new Date() } })

    return NextResponse.json({ success: true, data: tripDest }, { status: 201 })
  } catch (error) {
    // Unique constraint 錯誤：目的地已在行程中
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ success: false, message: '此目的地已在行程中' }, { status: 409 })
    }
    return NextResponse.json({ success: false, message: '新增失敗' }, { status: 500 })
  }
}
