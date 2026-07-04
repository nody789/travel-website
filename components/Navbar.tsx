'use client'
// 'use client' 原因：需要用 useSession() 來讀取登入狀態（Client Component 才有的 hook）
// 以及 useState 管理手機版漢堡選單的開關

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Globe, Heart, User, LogOut, Settings, Menu, X, Route } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  // useSession：Client Component 取得 session 的方式
  const { data: session, status } = useSession()
  // 手機版抽屜選單的開關 state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // usePathname：路由改變時自動關閉手機選單
  const pathname = usePathname()

  const initials = session?.user?.name?.charAt(0).toUpperCase() ?? '?'

  // 路由切換時關閉選單
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // 選單開啟時禁止 body 捲動
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    // cleanup：離開時恢復 overflow
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const navLinks = [
    { href: '/', label: '首頁' },
    { href: '/destinations', label: '探索目的地' },
    { href: '/events', label: '活動' },
    ...(session ? [
      { href: '/favorites', label: '收藏', icon: Heart },
      { href: '/trips', label: '我的行程', icon: Route },
    ] : []),
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-sky-600 hover:text-sky-700">
            <Globe className="h-6 w-6" />
            <span className="font-bold text-xl">Travel Explorer</span>
          </Link>

          {/* 中間導覽連結（桌機版，md 以上才顯示） */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              首頁
            </Link>
            <Link href="/destinations" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              探索目的地
            </Link>
            <Link href="/events" className="text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium">
              活動
            </Link>
            {session && (
              <>
                <Link
                  href="/favorites"
                  className="flex items-center gap-1 text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium"
                >
                  <Heart className="h-4 w-4" />
                  收藏
                </Link>
                <Link
                  href="/trips"
                  className="flex items-center gap-1 text-gray-600 hover:text-sky-600 transition-colors text-sm font-medium"
                >
                  <Route className="h-4 w-4" />
                  我的行程
                </Link>
              </>
            )}
          </div>

          {/* 右側：登入狀態 + 漢堡選單 */}
          <div className="flex items-center gap-3">
            {/* 登入狀態（桌機版） */}
            <div className="hidden md:block">
              {status === 'loading' ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full ring-2 ring-transparent hover:ring-sky-200 transition-all bg-transparent border-0 p-0 cursor-pointer">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
                      <AvatarFallback className="bg-sky-100 text-sky-700 text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.user?.name ?? '使用者'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/profile" />} className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      個人資料
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<Link href="/trips" />} className="flex items-center gap-2 cursor-pointer">
                      <Route className="h-4 w-4" />
                      我的行程
                    </DropdownMenuItem>
                    {session.user?.role === 'ADMIN' && (
                      <DropdownMenuItem render={<Link href="/admin" />} className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        管理後台
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      登出
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild size="sm" className="bg-sky-600 hover:bg-sky-700">
                  <Link href="/auth/signin">登入</Link>
                </Button>
              )}
            </div>

            {/* 手機版漢堡按鈕（md 以下才顯示） */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label={mobileMenuOpen ? '關閉選單' : '開啟選單'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 手機版遮罩（點擊遮罩關閉選單） */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 手機版側拉選單（從右側滑入） */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 選單頂部：Logo + 關閉按鈕 */}
        <div className="flex items-center justify-between px-4 h-16 border-b">
          <Link href="/" className="flex items-center gap-2 text-sky-600">
            <Globe className="h-5 w-5" />
            <span className="font-bold">Travel Explorer</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 登入者資訊（已登入才顯示） */}
        {session && (
          <div className="flex items-center gap-3 px-4 py-4 border-b bg-gray-50">
            <Avatar className="h-10 w-10">
              <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
              <AvatarFallback className="bg-sky-100 text-sky-700 font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{session.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
            </div>
          </div>
        )}

        {/* 導覽連結 */}
        <nav className="p-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-100 hover:text-sky-600 transition-colors font-medium"
            >
              {label}
            </Link>
          ))}

          {/* 管理後台（只有 ADMIN 才看得到） */}
          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-gray-700 hover:bg-gray-100 hover:text-sky-600 transition-colors font-medium"
            >
              <Settings className="h-4 w-4" />
              管理後台
            </Link>
          )}
        </nav>

        {/* 底部：登入/登出按鈕 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          {status === 'loading' ? null : session ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              登出
            </button>
          ) : (
            <div className="space-y-2">
              <Button asChild className="w-full bg-sky-600 hover:bg-sky-700">
                <Link href="/auth/signin">登入</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/register">建立帳號</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
