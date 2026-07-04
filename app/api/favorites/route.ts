// app/api/favorites/route.ts
//
// GET /api/favorites  — 取得目前登入使用者的收藏清單
// POST /api/favorites — 新增收藏

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const addFavoriteSchema = z.object({
  destinationId: z.string().min(1),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
            coverImage: true,
            rating: true,
            reviewCount: true,
            category: {
              select: { id: true, name: true, icon: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: favorites })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json(
        { success: false, message: '請先登入' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const result = addFavoriteSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: '請提供目的地 ID' },
        { status: 400 }
      )
    }

    const { destinationId } = result.data

    // 確認目的地存在
    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
    })
    if (!destination) {
      return NextResponse.json(
        { success: false, message: '目的地不存在' },
        { status: 404 }
      )
    }

    // 防止重複收藏（schema 有 @@unique）
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_destinationId: {
          userId: session.user.id,
          destinationId,
        },
      },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: '已經收藏過了' },
        { status: 409 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        destinationId,
      },
    })

    return NextResponse.json({ success: true, data: favorite }, { status: 201 })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
