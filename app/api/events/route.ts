// GET /api/events — 公開 API，取得前台顯示的活動（isActive=true，依開始日期排序）

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const events = await prisma.event.findMany({
    where: { isActive: true },
    orderBy: { startDate: 'asc' },
  })
  return NextResponse.json({ success: true, data: events })
}
