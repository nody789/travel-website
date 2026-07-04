// lib/cloudinary.ts — Cloudinary 圖片上傳工具（Server 端）
// 使用 cloudinary SDK，只能在 Node.js 環境（API Routes）呼叫，不能在 Edge Runtime 用

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// 將 Buffer 上傳至 Cloudinary，回傳圖片的 secure_url（https）
export async function uploadToCloudinary(
  buffer: Buffer,
  folder = 'travel-explorer'
): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary 上傳失敗'))
        } else {
          resolve(result.secure_url)
        }
      })
      .end(buffer)
  })
}
