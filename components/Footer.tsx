// Footer — 全站頁尾（Server Component，純靜態）
import Link from 'next/link'
import { Globe, Heart, Mail, GitBranch } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-sky-600">
              <Globe className="h-6 w-6" />
              <span className="font-bold text-lg">Travel Explorer</span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              探索世界各地的旅遊目的地，收藏你的夢想行程，參考真實旅客評論。
            </p>
          </div>

          {/* 探索 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">探索</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/destinations" className="hover:text-sky-600 transition-colors">所有目的地</Link></li>
              <li><Link href="/destinations?category=nature" className="hover:text-sky-600 transition-colors">自然景觀</Link></li>
              <li><Link href="/destinations?category=city" className="hover:text-sky-600 transition-colors">城市探索</Link></li>
              <li><Link href="/destinations?category=beach" className="hover:text-sky-600 transition-colors">海灘島嶼</Link></li>
              <li><Link href="/destinations?category=mountain" className="hover:text-sky-600 transition-colors">山岳健行</Link></li>
            </ul>
          </div>

          {/* 活動 & 服務 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">活動與服務</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li><Link href="/events" className="hover:text-sky-600 transition-colors">近期活動</Link></li>
              <li><Link href="/favorites" className="hover:text-sky-600 transition-colors">我的收藏</Link></li>
              <li><Link href="/profile" className="hover:text-sky-600 transition-colors">個人資料</Link></li>
              <li><Link href="/auth/register" className="hover:text-sky-600 transition-colors">免費註冊</Link></li>
            </ul>
          </div>

          {/* 聯絡 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">聯絡我們</h3>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-500 flex-shrink-0" />
                <span>hello@travel-explorer.com</span>
              </li>
              <li className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-sky-500 flex-shrink-0" />
                <a
                  href="https://github.com/nody789/travel-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-600 transition-colors"
                >
                  GitHub 原始碼
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 底部版權 */}
        <div className="mt-10 border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © {year} Travel Explorer. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-xs text-gray-400">
            Made with <Heart className="h-3 w-3 fill-red-400 text-red-400" /> for travel lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
