'use client'
// 'use client' 原因：需要 useState 管理表單欄位，以及 axios 呼叫 API
// Next.js 特有：如果只是顯示靜態內容可以用 Server Component，
// 但表單互動一定要 Client Component

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import axios from 'axios'

export default function RegisterPage() {
  const router = useRouter()

  // 表單欄位的 state（Controlled Component 模式）
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 前端先做密碼確認比對（減少 API 呼叫）
    if (password !== confirmPassword) {
      toast.error('兩次密碼輸入不一致')
      return
    }

    setIsLoading(true)

    try {
      // 呼叫 POST /api/auth/register
      await axios.post('/api/auth/register', { name, email, password })
      toast.success('註冊成功！請登入您的帳號')
      // 註冊成功後跳到登入頁
      router.push('/auth/signin')
    } catch (error) {
      // axios 的錯誤物件：error.response.data 是 API 回傳的 JSON
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('註冊失敗，請稍後再試')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Globe className="h-10 w-10 text-sky-600" />
          </div>
          <h1 className="font-bold text-2xl text-gray-900">建立帳號</h1>
          <p className="text-gray-500 text-sm mt-1">加入 Travel Explorer，開始探索世界</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                您的名稱
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="請輸入您的名稱"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                密碼
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 個字元"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                確認密碼
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次輸入密碼"
                required
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-700"
            >
              {isLoading ? '註冊中...' : '建立帳號'}
            </Button>
          </form>

          {/* 導向登入頁 */}
          <p className="mt-4 text-center text-sm text-gray-500">
            已有帳號？{' '}
            {/* Next.js <Link> 做 SPA 導頁，不會整頁重整 */}
            <Link href="/auth/signin" className="text-sky-600 hover:text-sky-700 font-medium">
              立即登入
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
