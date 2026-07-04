'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import axios from 'axios'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Trash2 } from 'lucide-react'

interface AdminReviewActionsProps {
  id: string
  isApproved: boolean
}

export default function AdminReviewActions({ id, isApproved }: AdminReviewActionsProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    setIsLoading(true)
    try {
      await axios.patch(`/api/admin/reviews/${id}`, { isApproved: !isApproved })
      toast.success(isApproved ? '已取消審核通過' : '評論已審核通過')
      router.refresh()
    } catch {
      toast.error('操作失敗')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete() {
    setIsLoading(true)
    try {
      await axios.delete(`/api/admin/reviews/${id}`)
      toast.success('評論已刪除')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('刪除失敗')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* 審核通過 / 取消通過 */}
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={handleApprove}
        className={`gap-1 ${!isApproved ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-gray-500'}`}
      >
        {isApproved ? (
          <><XCircle className="h-3.5 w-3.5" /> 取消通過</>
        ) : (
          <><CheckCircle className="h-3.5 w-3.5" /> 通過</>
        )}
      </Button>

      {/* 刪除 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }), 'gap-1')}>
          <Trash2 className="h-3.5 w-3.5" />
          刪除
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除評論</DialogTitle>
            <DialogDescription>確定要刪除這則評論嗎？此操作無法復原。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
            <Button variant="destructive" disabled={isLoading} onClick={handleDelete}>
              {isLoading ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
