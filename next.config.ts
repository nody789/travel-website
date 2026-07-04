import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // 允許從這些外部網域載入圖片
    // Next.js <Image> 只允許信任的網域，避免惡意圖片攻擊
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'res.cloudinary.com' },
      { hostname: 'lh3.googleusercontent.com' },  // Google 頭像
      { hostname: 'avatars.githubusercontent.com' }, // GitHub 頭像
      { hostname: 'profile.line-scdn.net' },        // LINE 頭像
    ],
  },
}

export default nextConfig
