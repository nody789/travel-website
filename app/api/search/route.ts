// app/api/search/route.ts — 即時搜尋 API（GET /api/search?q=...）
//
// 給 SearchBar 搜尋預覽 dropdown 使用，回傳前 6 筆符合條件的目的地
// 不需要登入（公開 API）

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()

  // 關鍵字少於 1 個字不搜尋
  if (!q || q.length < 1) {
    return NextResponse.json({ success: true, data: [] })
  }

  const destinations = await prisma.destination.findMany({
    where: {
      isPublished: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { category: { name: { contains: q, mode: 'insensitive' } } },
      ],
    },
    select: {
      id: true,
      name: true,
      location: true,
      coverImage: true,
      rating: true,
      category: { select: { name: true, icon: true } },
    },
    take: 6,
    orderBy: { rating: 'desc' },
  })

  return NextResponse.json({ success: true, data: destinations })
}
