// app/api/admin/categories/[id]/route.ts — DELETE /api/admin/categories/:id

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ success: false, message: '無權限' }, { status: 403 })

  try {
    const { id } = await params

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) {
      return NextResponse.json({ success: false, message: '分類不存在' }, { status: 404 })
    }

    // 刪除分類前先確認沒有目的地在使用它
    const destinationCount = await prisma.destination.count({ where: { categoryId: id } })
    if (destinationCount > 0) {
      return NextResponse.json(
        { success: false, message: `此分類有 ${destinationCount} 個目的地在使用，無法刪除` },
        { status: 409 }
      )
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json({ success: false, message: '伺服器錯誤' }, { status: 500 })
  }
}
