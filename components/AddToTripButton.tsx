'use client'
// 'use client' 原因：需要 useState 管理 dropdown 開關、useEffect 抓使用者行程、
// axios 呼叫 API 加入/建立行程

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Plus, Check, ChevronDown, Loader2, Route } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

// 行程的精簡型別（從 GET /api/trips 回傳）
interface TripSummary {
  id: string
  title: string
  _count: { destinations: number }
  // destinations 只回傳 id + destinationId，用來判斷此目的地是否已加入
  destinations: Array<{ id: string; destinationId: string }>
}

interface AddToTripButtonProps {
  destinationId: string
}

export default function AddToTripButton({ destinationId }: AddToTripButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [isLoadingTrips, setIsLoadingTrips] = useState(false)
  const [loadingTripId, setLoadingTripId] = useState<string | null>(null)

  // 建立新行程的 inline 輸入框
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTripTitle, setNewTripTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  // 點擊 dropdown 外側時關閉
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 打開 dropdown 時抓取使用者行程
  async function handleOpen() {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    setIsOpen((prev) => !prev)
    if (!isOpen) {
      setIsLoadingTrips(true)
      try {
        const res = await axios.get<{ success: boolean; data: TripSummary[] }>('/api/trips')
        setTrips(res.data.data)
      } catch {
        toast.error('載入行程失敗')
      } finally {
        setIsLoadingTrips(false)
      }
    }
  }

  // 點擊某個行程：加入或移除
  async function handleToggleTrip(trip: TripSummary) {
    const existing = trip.destinations.find((d) => d.destinationId === destinationId)
    setLoadingTripId(trip.id)

    try {
      if (existing) {
        // 已加入 → 移除
        await axios.delete(`/api/trips/${trip.id}/destinations/${existing.id}`)
        setTrips((prev) =>
          prev.map((t) =>
            t.id === trip.id
              ? { ...t, destinations: t.destinations.filter((d) => d.destinationId !== destinationId), _count: { destinations: t._count.destinations - 1 } }
              : t
          )
        )
        toast.success(`已從「${trip.title}」移除`)
      } else {
        // 未加入 → 加入
        const res = await axios.post<{ success: boolean; data: { id: string; destinationId: string } }>(
          `/api/trips/${trip.id}/destinations`,
          { destinationId }
        )
        setTrips((prev) =>
          prev.map((t) =>
            t.id === trip.id
              ? { ...t, destinations: [...t.destinations, { id: res.data.data.id, destinationId }], _count: { destinations: t._count.destinations + 1 } }
              : t
          )
        )
        toast.success(`已加入「${trip.title}」`)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '操作失敗')
      } else {
        toast.error('操作失敗')
      }
    } finally {
      setLoadingTripId(null)
    }
  }

  // 建立新行程並加入此目的地
  async function handleCreateTrip() {
    if (!newTripTitle.trim()) return
    setIsCreating(true)

    try {
      // 1. 建立行程
      const createRes = await axios.post<{ success: boolean; data: { id: string; title: string } }>(
        '/api/trips',
        { title: newTripTitle.trim() }
      )
      const newTrip = createRes.data.data

      // 2. 加入目的地
      const addRes = await axios.post<{ success: boolean; data: { id: string; destinationId: string } }>(
        `/api/trips/${newTrip.id}/destinations`,
        { destinationId }
      )

      // 3. 更新本地 state
      setTrips((prev) => [
        {
          id: newTrip.id,
          title: newTrip.title,
          _count: { destinations: 1 },
          destinations: [{ id: addRes.data.data.id, destinationId }],
        },
        ...prev,
      ])

      toast.success(`行程「${newTrip.title}」已建立並加入此目的地`)
      setNewTripTitle('')
      setShowCreateForm(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? '建立失敗')
      } else {
        toast.error('建立失敗')
      }
    } finally {
      setIsCreating(false)
    }
  }

  // 判斷此目的地是否已加入某行程
  function isAdded(trip: TripSummary) {
    return trip.destinations.some((d) => d.destinationId === destinationId)
  }

  return (
    <div ref={containerRef} className="relative">
      {/* 主按鈕 */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-between gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-sky-300 transition-all"
      >
        <div className="flex items-center gap-2">
          <Route className="h-4 w-4 text-sky-500" />
          加入行程規劃
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl z-50 overflow-hidden">
          {isLoadingTrips ? (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              載入中...
            </div>
          ) : (
            <>
              {trips.length === 0 && !showCreateForm ? (
                <p className="text-center text-sm text-gray-400 py-4">
                  還沒有行程，先建立一個吧
                </p>
              ) : (
                <ul className="max-h-48 overflow-y-auto">
                  {trips.map((trip) => {
                    const added = isAdded(trip)
                    const loading = loadingTripId === trip.id
                    return (
                      <li key={trip.id}>
                        <button
                          onClick={() => handleToggleTrip(trip)}
                          disabled={loading}
                          className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{trip.title}</p>
                            <p className="text-xs text-gray-400">{trip._count.destinations} 個目的地</p>
                          </div>
                          {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : added ? (
                            <Check className="h-4 w-4 text-sky-600" />
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}

              {/* 建立新行程 */}
              <div className="border-t">
                {showCreateForm ? (
                  <div className="p-3 flex items-center gap-2">
                    <input
                      autoFocus
                      value={newTripTitle}
                      onChange={(e) => setNewTripTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTrip()}
                      placeholder="行程名稱（例：日本七日遊）"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      onClick={handleCreateTrip}
                      disabled={!newTripTitle.trim() || isCreating}
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : '建立'}
                    </button>
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-sky-600 hover:bg-sky-50 transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    建立新行程
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
