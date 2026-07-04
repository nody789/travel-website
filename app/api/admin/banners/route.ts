// GET  /api/admin/banners — 取得所有 Banner（含隱藏的）
// POST /api/admin/banners — 新增 Banner

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

const bannerSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100),
  subtitle: z.string().max(200).optional(),
  image: z.string().url('請輸入有效的圖片 URL'),
  link: z.string().url('請輸入有效的連結').optional().or(z.literal('')),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
})

export async function GET() {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const banners = await prisma.banner.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json({ success: true, data: banners })
}

export async function POST(request: Request) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const body: unknown = await request.json()
  const result = bannerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { link, ...rest } = result.data
  const banner = await prisma.banner.create({
    data: { ...rest, link: link || null },
  })
  return NextResponse.json({ success: true, data: banner }, { status: 201 })
}
