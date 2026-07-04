import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: '無權限' }

export default function ForbiddenPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <ShieldX className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <h1 className="font-bold text-4xl text-gray-900 mb-2">403</h1>
        <p className="text-xl text-gray-600 mb-2">無權限存取</p>
        <p className="text-gray-500 mb-8">你沒有權限存取此頁面，需要管理員身份</p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-sky-600 hover:bg-sky-700">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
