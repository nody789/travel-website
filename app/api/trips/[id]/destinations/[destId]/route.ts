// app/api/trips/[id]/destinations/[destId]/route.ts — 從行程移除目的地（DELETE）
// destId 是 TripDestination.id（不是 Destination.id）

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/trips/[id]/destinations/[destId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; destId: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  const { id: tripId, destId } = await params

  // 確認行程存在且屬於目前使用者
  const trip = await prisma.trip.findUnique({ where: { id: tripId } })
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ success: false, message: '行程不存在' }, { status: 404 })
  }

  const tripDest = await prisma.tripDestination.findUnique({ where: { id: destId } })
  if (!tripDest || tripDest.tripId !== tripId) {
    return NextResponse.json({ success: false, message: '記錄不存在' }, { status: 404 })
  }

  await prisma.tripDestination.delete({ where: { id: destId } })

  return NextResponse.json({ success: true, data: null })
}
