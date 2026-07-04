// app/api/admin/destinations/[id]/route.ts
//
// PATCH  /api/admin/destinations/:id — 更新目的地
// DELETE /api/admin/destinations/:id — 刪除目的地

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

async function requireAdmin() {
  const session = await auth()
  if (!session) return { error: '請先登入', status: 401 }
  if (session.user.role !== 'ADMIN') return { error: '無權限', status: 403 }
  return { session, error: null, status: 200 }
}

// Partial<> 讓所有欄位都變成可選，適合 PATCH（部分更新）
const updateDestinationSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  coverImage: z.string().url().optional(),
  categoryId: z.string().min(1).optional(),
  isPublished: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status })
  }

  try {
    const { id } = await params

    const destination = await prisma.destination.findUnique({ where: { id } })
    if (!destination) {
      return NextResponse.json(
        { success: false, message: '目的地不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const result = updateDestinationSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const updated = await prisma.destination.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { error, status } = await requireAdmin()
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status })
  }

  try {
    const { id } = await params

    const destination = await prisma.destination.findUnique({ where: { id } })
    if (!destination) {
      return NextResponse.json(
        { success: false, message: '目的地不存在' },
        { status: 404 }
      )
    }

    await prisma.destination.delete({ where: { id } })

    return NextResponse.json({ success: true, data: null })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
