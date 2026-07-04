// app/api/admin/categories/route.ts — POST /api/admin/categories

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

const createCategorySchema = z.object({
  name: z.string().min(1, '分類名稱不能為空'),
  icon: z.string().min(1, '請輸入 Icon'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug 只能含小寫字母、數字、連字號'),
})

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ success: false, message: '無權限' }, { status: 403 })

  try {
    const body = await request.json()
    const result = createCategorySchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const existing = await prisma.category.findUnique({
      where: { slug: result.data.slug },
    })
    if (existing) {
      return NextResponse.json(
        { success: false, message: '此 Slug 已被使用' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({ data: result.data })
    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: '伺服器錯誤' }, { status: 500 })
  }
}
