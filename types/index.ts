// 這個檔案集中放所有 TypeScript 型別定義
// 統一放在這裡的好處：修改型別只需要改一個地方，所有用到的地方都會自動更新

// ─── 角色 ─────────────────────────────────────────────────
// 使用者有兩種角色：一般會員（USER）和管理員（ADMIN）
// 這裡用 TypeScript 的聯合型別（Union Type）
export type Role = 'USER' | 'ADMIN'

// ─── 分類 ─────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  icon: string
  slug: string
}

// ─── 目的地 ───────────────────────────────────────────────
export interface Destination {
  id: string
  name: string
  slug: string
  description: string
  location: string
  coverImage: string
  rating: number
  reviewCount: number
  isPublished: boolean
  categoryId: string
  category: Category        // 巢狀物件：目的地包含分類資訊
  // Date | string：API 回傳字串，Prisma 直接回傳 Date，兩種都要支援
  createdAt: Date | string
  updatedAt: Date | string
}

// 列表頁只需要部分欄位，不需要完整的 description
// Pick 是 TypeScript 工具型別：從 Destination 中挑出指定欄位
export type DestinationSummary = Pick<
  Destination,
  'id' | 'name' | 'slug' | 'location' | 'coverImage' | 'rating' | 'reviewCount' | 'category'
>

// ─── 使用者 ───────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string | null       // name 可能是 null（OAuth 登入時有時沒有名稱）
  image: string | null
  role: Role
}

// ─── 收藏 ─────────────────────────────────────────────────
export interface Favorite {
  id: string
  userId: string
  destinationId: string
  destination: DestinationSummary
  createdAt: string
}

// ─── 評論 ─────────────────────────────────────────────────
export interface Review {
  id: string
  userId: string
  destinationId: string
  rating: number            // 1-5
  comment: string
  isApproved: boolean
  user: Pick<User, 'id' | 'name' | 'image'>  // 評論只需要顯示使用者的部分資訊
  createdAt: Date | string
  updatedAt: Date | string
}

// ─── API 回應格式 ──────────────────────────────────────────
// 泛型（Generics）：T 是一個佔位符號，使用時再指定實際型別
// 這樣 ApiResponse 就可以包裝任何型別的 data
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string          // 失敗時才有，所以是 optional（加 ?）
}

// 分頁回應格式
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

// ─── 表單輸入型別 ──────────────────────────────────────────
// 這些是前端表單送出時的資料格式

export interface CreateDestinationInput {
  name: string
  slug: string
  description: string
  location: string
  coverImage: string
  categoryId: string
  isPublished: boolean
}

// Partial<T> 讓所有欄位都變成可選，適合「更新」的情境
// 因為更新時不一定每個欄位都要填
export type UpdateDestinationInput = Partial<CreateDestinationInput>

export interface CreateReviewInput {
  rating: number
  comment: string
}

// ─── NextAuth.js Session 型別擴充 ─────────────────────────
// NextAuth.js 預設的 session 沒有 role 欄位
// 這裡擴充 Session 型別，讓 TypeScript 知道 session.user.role 存在
// 這個 declare module 語法叫做「模組擴充（Module Augmentation）」
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string | null
      image: string | null
      role: Role
    }
  }

  interface User {
    role: Role
  }
}
