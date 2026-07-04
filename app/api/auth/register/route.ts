// Server Component：POST /api/auth/register
// 處理 Email 註冊：驗證輸入 → 檢查 Email 是否重複 → bcrypt 加密密碼 → 建立使用者

import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Zod 驗證 schema：確保 name、email、password 格式正確
const registerSchema = z.object({
  name: z.string().min(2, '名稱至少 2 個字').max(50, '名稱最多 50 個字'),
  email: z.string().email('Email 格式不正確'),
  password: z
    .string()
    .min(8, '密碼至少 8 個字元')
    .max(100, '密碼最多 100 個字元'),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()

    // Zod 驗證輸入
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // 檢查 Email 是否已被使用
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '此 Email 已被註冊' },
        { status: 409 }
      )
    }

    // bcrypt 加密密碼（cost factor 12：安全和速度的平衡）
    const hashedPassword = await bcrypt.hash(password, 12)

    // 建立新使用者
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    })

    return NextResponse.json(
      { success: true, data: user },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
