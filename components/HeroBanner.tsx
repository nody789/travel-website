'use client'
// 'use client' 原因：輪播需要 useState 管理目前顯示的 index，
// 以及 setInterval 做自動輪播（這些都是 Client Component 才能用的功能）

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  image: string
  link: string | null
}

interface HeroBannerProps {
  banners: Banner[]
}

// Server Component 從 DB 抓好資料後，把 banners 當 props 傳進來
// 這樣可以保持 SEO（資料在 Server 端抓取），只把互動邏輯放在 Client
export default function HeroBanner({ banners }: HeroBannerProps) {
  // 目前顯示的 Banner 索引
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const total = banners.length

  const next = useCallback(() => {
    // % total 讓索引循環：最後一張後回到第一張
    setCurrent((prev) => (prev + 1) % total)
  }, [total])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }, [total])

  // 自動輪播：每 5 秒換一張，滑鼠移入時暫停
  // useEffect dependency: [next, isPaused] — next 改變或暫停狀態改變時重新設定 interval
  useEffect(() => {
    if (isPaused || total <= 1) return
    const timer = setInterval(next, 5000)
    // cleanup 函式：離開時清除 interval，避免 memory leak
    return () => clearInterval(timer)
  }, [next, isPaused, total])

  if (total === 0) return null

  const banner = banners[current]

  return (
    <div
      className="relative h-[480px] md:h-[560px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 圖片層：absolute fill 撐滿容器 */}
      <Image
        key={banner.id}
        src={banner.image}
        alt={banner.title}
        fill
        className="object-cover transition-opacity duration-700"
        priority
        unoptimized
      />

      {/* 漸層遮罩（讓文字清楚可讀） */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      {/* 文字內容 */}
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <h2 className="font-bold text-3xl md:text-4xl mb-2 drop-shadow">{banner.title}</h2>
        {banner.subtitle && (
          <p className="text-lg text-white/85 mb-4 drop-shadow">{banner.subtitle}</p>
        )}
        {banner.link && (
          // Next.js <Link>：SPA 導頁，不會整頁重整，比 <a> 更快
          <Link
            href={banner.link}
            className="inline-block rounded-lg bg-white/20 backdrop-blur-sm border border-white/40 px-5 py-2 text-sm font-medium hover:bg-white/30 transition-colors"
          >
            了解更多 →
          </Link>
        )}
      </div>

      {/* 左右箭頭（只有超過一張才顯示） */}
      {total > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
            aria-label="上一張"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
            aria-label="下一張"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* 指示點（Dots） */}
      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`第 ${i + 1} 張`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
