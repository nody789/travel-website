'use client'
// 'use client' 原因：需要 useRouter / useSearchParams 來修改 URL query params

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeSlug = searchParams.get('category')

  function handleSelect(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    params.set('page', '1') // 切換分類後重置到第一頁
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    // overflow-x-auto + flex：水平捲動，手機可以左右滑
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {/* 「全部」選項 */}
      <button
        onClick={() => handleSelect(null)}
        className={cn(
          'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-sky-600 text-white'       // 選中：sky-600 底色
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'  // 未選中
        )}
      >
        全部
      </button>

      {/* 各分類按鈕
          key 用 category.id（唯一），不用 index
          原因：如果用 index，增刪分類時 React 無法正確追蹤元素對應關係 */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => handleSelect(category.slug)}
          className={cn(
            'flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
            activeSlug === category.slug
              ? 'bg-sky-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {category.icon} {category.name}
        </button>
      ))}
    </div>
  )
}
