// app/api/destinations/[id]/route.ts — GET /api/destinations/:id
// 公開端點，取得單一目的地完整資訊

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const destination = await prisma.destination.findUnique({
      where: { id, isPublished: true },
      include: {
        category: true,
      },
    })

    if (!destination) {
      return NextResponse.json(
        { success: false, message: '目的地不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: destination })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
