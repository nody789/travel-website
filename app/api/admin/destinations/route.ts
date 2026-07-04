// app/api/admin/destinations/route.ts
//
// GET  /api/admin/destinations — 取得所有目的地（含未上架）
// POST /api/admin/destinations — 新增目的地
//
// 所有後台 API 都必須驗證 session.user.role === 'ADMIN'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// 確認是否為 ADMIN 的共用函式
async function requireAdmin() {
  const session = await auth()
  if (!session) return { error: '請先登入', status: 401 }
  if (session.user.role !== 'ADMIN') return { error: '無權限', status: 403 }
  return { session, error: null, status: 200 }
}

const createDestinationSchema = z.object({
  name: z.string().min(1, '名稱不能為空'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug 只能包含小寫字母、數字和連字號'),
  description: z.string().min(1, '描述不能為空'),
  location: z.string().min(1, '地點不能為空'),
  coverImage: z.string().url('請輸入有效的圖片 URL'),
  categoryId: z.string().min(1, '請選擇分類'),
  isPublished: z.boolean(),
})

export async function GET() {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status })
  }

  try {
    const destinations = await prisma.destination.findMany({
      include: {
        category: { select: { id: true, name: true, icon: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: destinations })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status })
  }

  try {
    const body = await request.json()
    const result = createDestinationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    // 檢查 slug 是否已存在
    const existing = await prisma.destination.findUnique({
      where: { slug: result.data.slug },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: '此 Slug 已被使用' },
        { status: 409 }
      )
    }

    const destination = await prisma.destination.create({ data: result.data })

    return NextResponse.json(
      { success: true, data: destination },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
