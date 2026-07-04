// app/api/upload/route.ts — 圖片上傳 API（POST /api/upload）
//
// 接收 multipart/form-data，把圖片上傳到 Cloudinary，回傳 secure_url
// 需要登入才能使用（任何角色皆可，前台個人頭像和後台圖片都走這裡）

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ success: false, message: '請先登入' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: '請提供圖片檔案' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: '檔案大小不能超過 5MB' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: '只支援 JPEG、PNG、WebP、GIF 格式' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToCloudinary(buffer)

    return NextResponse.json({ success: true, data: { url } })
  } catch {
    return NextResponse.json({ success: false, message: '上傳失敗，請稍後再試' }, { status: 500 })
  }
}
