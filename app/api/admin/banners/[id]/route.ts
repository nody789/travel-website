// PUT    /api/admin/banners/[id] — 更新 Banner
// DELETE /api/admin/banners/[id] — 刪除 Banner

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

const updateBannerSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100).optional(),
  subtitle: z.string().max(200).optional().nullable(),
  image: z.string().url('請輸入有效的圖片 URL').optional(),
  link: z.string().url('請輸入有效的連結').optional().nullable().or(z.literal('')),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, context: RouteContext) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const { id } = await context.params
  const body: unknown = await request.json()
  const result = updateBannerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { link, ...rest } = result.data
  const banner = await prisma.banner.update({
    where: { id },
    data: { ...rest, ...(link !== undefined ? { link: link || null } : {}) },
  })
  return NextResponse.json({ success: true, data: banner })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const { id } = await context.params
  await prisma.banner.delete({ where: { id } })
  return NextResponse.json({ success: true, data: null })
}
