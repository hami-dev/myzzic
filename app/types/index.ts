export interface FoodCategory {
  id: string
  name: string
  createdAt: string
}

export interface Food {
  id: string
  categoryId: string
  name: string
  expiresAt: string // ISO date string (YYYY-MM-DD)
  createdAt: string
}

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'fresh'

export interface CleaningType {
  id: string
  name: string
  createdAt: string
}

export interface CleaningRecord {
  id: string
  cleaningTypeId: string
  date: string // ISO date string (YYYY-MM-DD)
  createdAt: string
}
