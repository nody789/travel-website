// PUT    /api/admin/events/[id] — 更新活動
// DELETE /api/admin/events/[id] — 刪除活動

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

const updateEventSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  image: z.string().url().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  location: z.string().max(200).optional().nullable(),
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
  const result = updateEventSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { success: false, message: result.error.issues[0].message },
      { status: 400 }
    )
  }

  const { startDate, endDate, ...rest } = result.data
  const event = await prisma.event.update({
    where: { id },
    data: {
      ...rest,
      ...(startDate ? { startDate: new Date(startDate) } : {}),
      ...(endDate ? { endDate: new Date(endDate) } : {}),
    },
  })
  return NextResponse.json({ success: true, data: event })
}

export async function DELETE(_request: Request, context: RouteContext) {
  const check = await requireAdmin()
  if (check.error) {
    return NextResponse.json({ success: false, message: check.error }, { status: check.status })
  }

  const { id } = await context.params
  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true, data: null })
}
