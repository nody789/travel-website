// app/api/categories/route.ts — GET /api/categories
// 公開端點，不需要登入
// Server Component 可以直接呼叫這個，或 Client Component 透過 axios 呼叫

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
