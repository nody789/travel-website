'use client'
// 'use client' 原因：有 Dialog 確認刪除的互動，需要 useState 控制 dialog 開關

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'

interface AdminDestinationActionsProps {
  id: string
  name: string
}

export default function AdminDestinationActions({ id, name }: AdminDestinationActionsProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/admin/destinations/${id}`)
      toast.success('目的地已刪除')
      setOpen(false)
      router.refresh() // 重新取得 Server Component 的資料
    } catch {
      toast.error('刪除失敗，請稍後再試')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm" className="gap-1">
        <Link href={`/admin/destinations/${id}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
          編輯
        </Link>
      </Button>

      {/* 刪除需要確認 Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }), 'gap-1')}>
          <Trash2 className="h-3.5 w-3.5" />
          刪除
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              你確定要刪除「{name}」嗎？此操作無法復原，相關的收藏和評論也會一起刪除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
