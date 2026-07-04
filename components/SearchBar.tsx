'use client'
// 'use client' 原因：
// 1. useState — 輸入值、搜尋預覽結果、dropdown 開關
// 2. useEffect — debounce 延遲更新 URL 和呼叫搜尋 API
// 3. useRouter / useSearchParams / usePathname — 修改 URL（Client Component 限定）
// 4. useRef — 偵測點擊 dropdown 外側以關閉

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import axios from 'axios'

// 搜尋預覽結果的型別
interface SearchResult {
  id: string
  name: string
  location: string
  coverImage: string
  rating: number
  category: { name: string; icon: string }
}

interface SearchBarProps {
  placeholder?: string
  className?: string
  // showPreview: 是否顯示即時搜尋 dropdown（目的地頁面不需要，因為本身就是搜尋結果頁）
  showPreview?: boolean
}

export default function SearchBar({
  placeholder = '搜尋目的地...',
  className,
  showPreview = false,
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // 初始值從 URL 的 ?search= 取得，這樣重新整理後搜尋值還在
  const [value, setValue] = useState(searchParams.get('search') ?? '')

  // 搜尋預覽相關 state
  const [previewResults, setPreviewResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // containerRef 用來偵測「點擊 dropdown 外側」以關閉
  const containerRef = useRef<HTMLDivElement>(null)

  // useEffect dependency [value]:
  // value 改變時才觸發，300ms debounce 避免每打一個字就發一次請求
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.set('page', '1')
      router.push(`${pathname}?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  // useEffect dependency [value, showPreview]:
  // 搜尋預覽：輸入時呼叫 /api/search，結果顯示在 dropdown
  useEffect(() => {
    if (!showPreview) return

    if (!value.trim()) {
      setPreviewResults([])
      setShowDropdown(false)
      return
    }

    // 200ms debounce（比 URL 更新稍快，讓 dropdown 感覺更即時）
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await axios.get<{ success: boolean; data: SearchResult[] }>(
          `/api/search?q=${encodeURIComponent(value.trim())}`
        )
        setPreviewResults(res.data.data)
        setShowDropdown(res.data.data.length > 0)
      } catch {
        // 搜尋失敗靜默處理，不影響正常搜尋功能
      } finally {
        setIsSearching(false)
      }
    }, 200)

    return () => clearTimeout(timer)
  }, [value, showPreview])

  // 點擊 dropdown 外側時關閉
  useEffect(() => {
    if (!showPreview) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPreview])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          if (showPreview && previewResults.length > 0) setShowDropdown(true)
        }}
        placeholder={placeholder}
        className="pl-9 pr-9 w-full"
      />
      {/* 清除按鈕：有輸入才顯示 */}
      {value && (
        <button
          onClick={() => {
            setValue('')
            setShowDropdown(false)
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="清除搜尋"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* 搜尋即時預覽 Dropdown
          只在 showPreview 為 true 且有結果時顯示 */}
      {showPreview && showDropdown && previewResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl z-50 overflow-hidden">
          <div className="px-3 py-2 text-xs font-medium text-gray-400 border-b bg-gray-50">
            搜尋結果
          </div>
          <ul>
            {previewResults.map((result) => (
              <li key={result.id}>
                {/* Next.js <Link> 取代 <a>：SPA 導頁不重載頁面，速度更快 */}
                <Link
                  href={`/destinations/${result.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-sky-50 transition-colors"
                  onClick={() => {
                    setShowDropdown(false)
                    setValue('')
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.coverImage}
                    alt={result.name}
                    className="h-10 w-14 rounded-md object-cover flex-shrink-0 bg-gray-100"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{result.location}</span>
                      <span className="ml-1 text-gray-300">·</span>
                      <span>{result.category.icon} {result.category.name}</span>
                    </div>
                  </div>
                  {result.rating > 0 && (
                    <span className="text-xs font-medium text-yellow-500 flex-shrink-0">
                      ★ {result.rating.toFixed(1)}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
          {/* 「查看全部」連結 */}
          <div className="border-t">
            <Link
              href={`/destinations?search=${encodeURIComponent(value)}`}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-sky-600 hover:bg-sky-50 transition-colors font-medium"
              onClick={() => setShowDropdown(false)}
            >
              <Search className="h-3.5 w-3.5" />
              查看「{value}」的所有結果
            </Link>
          </div>
        </div>
      )}

      {/* 搜尋中提示（可選，避免 dropdown 閃動） */}
      {showPreview && isSearching && value && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl z-50 px-4 py-3 text-sm text-gray-400">
          搜尋中...
        </div>
      )}
    </div>
  )
}
