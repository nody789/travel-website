// app/api/favorites/[id]/route.ts — DELETE /api/favorites/:id
// 這個 :id 是 favorite 的 id，不是 destination 的 id

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 確認是自己的收藏才能刪除（避免 A 刪掉 B 的收藏）
    const favorite = await prisma.favorite.findUnique({
      where: { id },
    })

    if (!favorite) {
      return NextResponse.json(
        { success: false, message: '收藏不存在' },
        { status: 404 }
      )
    }

    if (favorite.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: '無權限' },
        { status: 403 }
      )
    }

    await prisma.favorite.delete({ where: { id } })

    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
