// app/api/profile/route.ts — 個人資料更新 API（PUT /api/profile）
// 需要登入，只能更新自己的資料

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(2, '名稱至少 2 個字').max(50, '名稱最長 50 個字'),
  // image 可以是有效 URL 或空字串（清除頭像）
  image: z.string().url('請輸入有效的圖片網址').or(z.literal('')).optional(),
})

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = updateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, image } = result.data

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        // image 傳空字串時設為 null（清除頭像）
        ...(image !== undefined && { image: image || null }),
      },
      select: { id: true, name: true, email: true, image: true },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json({ success: false, message: '更新失敗，請稍後再試' }, { status: 500 })
  }
}
