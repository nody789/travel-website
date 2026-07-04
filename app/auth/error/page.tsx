'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'

// NextAuth.js 的錯誤代碼對應說明
const errorMessages: Record<string, string> = {
  Configuration: '伺服器設定錯誤，請聯絡管理員',
  AccessDenied: '存取被拒絕，你可能沒有權限',
  Verification: '驗證連結已過期，請重新申請',
  Default: '登入時發生錯誤，請稍後再試',
  OAuthSignin: '無法啟動 OAuth 登入流程',
  OAuthCallback: 'OAuth 回呼發生錯誤',
  OAuthCreateAccount: '無法建立 OAuth 帳號',
  EmailCreateAccount: '無法建立 Email 帳號',
  Callback: '登入回呼發生錯誤',
  OAuthAccountNotLinked: '此 Email 已用其他登入方式註冊，請使用原本的方式登入',
  EmailSignin: '驗證信發送失敗',
  CredentialsSignin: '信箱或密碼錯誤',
  SessionRequired: '請先登入才能存取此頁面',
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') ?? 'Default'
  const message = errorMessages[error] ?? errorMessages.Default

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h1 className="font-bold text-2xl text-gray-900 mb-2">登入失敗</h1>
        <p className="text-gray-500 mb-8">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/auth/signin">重新登入</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <ErrorContent />
    </Suspense>
  )
}
