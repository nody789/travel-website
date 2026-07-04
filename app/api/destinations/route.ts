// app/api/destinations/route.ts — GET /api/destinations
// 公開端點，支援分類篩選、搜尋、分頁
//
// 查詢參數：
// ?category=natural   依分類 slug 篩選
// ?search=九份         搜尋名稱或地點
// ?page=1              第幾頁（預設 1）
// ?limit=12            每頁幾筆（預設 12）

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'))
    const skip = (page - 1) * limit

    // 動態組合 Prisma 的 where 條件
    const where = {
      isPublished: true,
      // 分類篩選：如果有傳 category，就過濾 category.slug
      ...(category && {
        category: { slug: category },
      }),
      // 搜尋：名稱或地點包含關鍵字（不分大小寫）
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { location: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    // 用 Promise.all 並行取資料和總數，加快速度
    const [items, total] = await Promise.all([
      prisma.destination.findMany({
        where,
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.destination.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤' },
      { status: 500 }
    )
  }
}
