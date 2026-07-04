'use client'
// 'use client' 原因：需要 useState 管理上傳狀態、useRef 控制 file input、axios 呼叫 API
//
// 通用圖片上傳元件：可貼上 URL 或從本機上傳圖片（上傳後取得 Cloudinary URL）

import { useState, useRef } from 'react'
import { Upload, LinkIcon, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import axios from 'axios'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
  required?: boolean
}

export default function ImageUpload({ value, onChange, label, required }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  // useRef 直接操作 DOM 的 file input，不需要 useState 追蹤它的值
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      // multipart/form-data 的 Content-Type 由 axios 自動設定（包含 boundary），不要手動設
      const res = await axios.post<{ success: boolean; data: { url: string } }>('/api/upload', formData)
      onChange(res.data.data.url)
      toast.success('圖片上傳成功')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '上傳失敗')
      } else {
        toast.error('上傳失敗，請稍後再試')
      }
    } finally {
      setIsUploading(false)
      // 清空 value 讓同一張圖片也能再次觸發 onChange 事件
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}{required && ' *'}
        </label>
      )}

      {/* URL 輸入 + 上傳按鈕並排 */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... 貼上圖片網址"
            className="pl-9"
          />
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isUploading ? '上傳中...' : '上傳圖片'}
        </button>

        {/* type="file" 隱藏，由按鈕觸發 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 圖片預覽：有 URL 才顯示 */}
      {value && (
        <div className="relative">
          <div className="relative h-40 w-full rounded-lg overflow-hidden border bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="預覽"
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </div>
          {/* 清除按鈕 */}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
            title="移除圖片"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
