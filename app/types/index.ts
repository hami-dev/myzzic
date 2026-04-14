export interface Pet {
  id: string
  name: string
  color?: string  // UI 구분용 hex 색상
  createdAt: string
}

export interface FoodCategory {
  id: string
  name: string
  createdAt: string
}

export interface Food {
  id: string
  petIds: string[]  // 귀속된 반려동물 id 목록. [] = 미귀속(공유)
  categoryId: string
  name: string
  expiresAt: string // ISO date string (YYYY-MM-DD)
  createdAt: string
}

export type ExpiryStatus = 'expired' | 'critical' | 'warning' | 'fresh'

export interface CleaningType {
  id: string
  petId?: string  // 귀속된 반려동물 id. undefined = 미귀속
  name: string
  color?: string  // hex 색상 (예: '#ef4444'). 미설정 시 DEFAULT_COLOR 사용
  createdAt: string
}

export interface CleaningRecord {
  id: string
  cleaningTypeId: string
  date: string // ISO date string (YYYY-MM-DD)
  createdAt: string
}
