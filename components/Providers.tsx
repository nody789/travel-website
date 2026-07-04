'use client'
// 'use client' 原因：SessionProvider 是 Context Provider，
// Context 需要在 Client Component 中使用。
// 但 layout.tsx 本身是 Server Component，不能直接用 SessionProvider。
// 解法：把 Provider 包成一個 Client Component，再在 Server Component 的 layout 裡使用。
//
// 這是 Next.js App Router 的常見模式：
// Server Component（layout.tsx）可以包含 Client Component（Providers.tsx），
// 但 Client Component 不能包含 Server Component。

import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      {children}
      {/* Toaster 放在這裡，讓整個 app 都能用 toast() 顯示通知 */}
      <Toaster position="top-right" richColors />
    </SessionProvider>
  )
}
