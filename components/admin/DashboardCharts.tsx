'use client'
// 'use client' 原因：Recharts 使用 ResizeObserver、SVG 動畫等瀏覽器 API，必須在 Client Component 執行
//
// 後台儀表板圖表：折線圖（目的地 & 評論）+ 長條圖（新會員）
// 資料從 Server Component (admin/page.tsx) 以 props 傳入，圖表本身只負責渲染

import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts'

// 每個月份的統計數據
interface MonthlyData {
  month: string       // 顯示用的月份標籤，例如「1月」
  destinations: number
  reviews: number
  users: number
}

interface DashboardChartsProps {
  data: MonthlyData[]
}

export default function DashboardCharts({ data }: DashboardChartsProps) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 折線圖：每月新增目的地 & 評論 */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-1">每月新增（目的地 & 評論）</h3>
        <p className="text-xs text-gray-400 mb-4">近 6 個月趨勢</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="destinations"
              name="目的地"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 4, fill: '#0ea5e9' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="reviews"
              name="評論"
              stroke="#f97316"
              strokeWidth={2}
              dot={{ r: 4, fill: '#f97316' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 長條圖：每月新增會員 */}
      <div className="rounded-xl border bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-1">每月新增會員</h3>
        <p className="text-xs text-gray-400 mb-4">近 6 個月成長</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
            />
            <Bar
              dataKey="users"
              name="新會員"
              fill="#818cf8"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
