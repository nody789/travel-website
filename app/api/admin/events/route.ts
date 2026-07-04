// GET  /api/admin/events — 取得所有活動（含隱藏的）
// POST /api/admin/events — 新增活動

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

async function requireAdmin() {
  const session = await auth()
  if (!session) return { error: '請先登入', status: 401 }
  if (session.user.role !== 'ADMIN') return { error: '無權限', status: 403 }
  return { session, error: null, status: 200 }
}

const eventSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(200),
  description: z.string().min(1, '描述不能為空'),
  image: z.string().url('請輸入有效的圖片 URL'),
  startDate: z.string().datetime('日期格式錯誤'),
  endDate: z.string().datetime('日期格式錯誤'),
  location: z.string().max(200).optional(),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const events = await prisma.event.findMany({ orderBy: { startDate: 'desc' } })
  return NextResponse.json({ success: true, data: events })
}

export async function POST(request: Request) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const body: unknown = await request.json()
  const result = eventSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const event = await prisma.event.create({
    data: {
      ...result.data,
      startDate: new Date(result.data.startDate),
      endDate: new Date(result.data.endDate),
    },
  })
  return NextResponse.json({ success: true, data: event }, { status: 201 })
}
