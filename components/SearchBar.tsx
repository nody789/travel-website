'use client'
// 'use client' 原因：需要 useState（追蹤輸入值）、useEffect（實作 debounce）、
// 以及 useRouter / useSearchParams 來修改 URL（只有 Client Component 才有這些）

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

export default function SearchBar({ placeholder = '搜尋目的地...', className }: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 初始值從 URL 的 ?search= 取得，這樣重新整理後搜尋值還在
  const [value, setValue] = useState(searchParams.get('search') ?? '')

  // useEffect dependency array 說明：
  // [value] — value 改變時才觸發，實作 debounce（等使用者停止輸入 300ms 後才更新 URL）
  // 好處：避免每打一個字就發一次 API 請求
  useEffect(() => {
    const timer = setTimeout(() => {
      // 複製目前的 searchParams，修改 search 和 page，再 push 新 URL
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.set('page', '1') // 搜尋後重置到第一頁

      router.push(`${pathname}?${params.toString()}`)
    }, 300)

    // cleanup：下一次 value 改變前，清掉上一個 timer
    return () => clearTimeout(timer)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 w-full"
      />
      {/* 清除按鈕：有輸入才顯示 */}
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="清除搜尋"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
