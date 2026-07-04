// app/api/admin/reviews/route.ts — GET /api/admin/reviews
// 取得所有評論（含待審核），管理員用

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, message: '無權限' }, { status: 403 })
  }

  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        destination: { select: { id: true, name: true } },
      },
      orderBy: [
        { isApproved: 'asc' }, // 待審核的排在前面
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ success: true, data: reviews })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
