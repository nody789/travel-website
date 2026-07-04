// GET /api/banners — 公開 API，取得前台顯示的 Banner（isActive=true，依 order 排序）

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ success: true, data: banners })
}
