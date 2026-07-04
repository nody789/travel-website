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
import { Trash2 } from 'lucide-react'

export default function AdminCategoryDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await axios.delete(`/api/admin/categories/${id}`)
      toast.success('分類已刪除')
      setOpen(false)
      router.refresh()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '刪除失敗')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }), 'gap-1')}>
        <Trash2 className="h-3.5 w-3.5" />
        刪除
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>確認刪除分類</DialogTitle>
          <DialogDescription>
            確定要刪除「{name}」分類嗎？若有目的地使用此分類，無法刪除。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
          <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
            {isDeleting ? '刪除中...' : '確認刪除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
