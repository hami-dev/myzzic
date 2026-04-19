export interface Pet {
  id: string
  name: string
  species?: string  // 종류 (예: 강아지, 고양이 등)
  color?: string    // UI 구분용 hex 색상
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
  petId?: string  // 기록한 반려동물 id. 공통 타입도 펫별 독립 기록 가능. undefined = 레거시(공유)
  date: string // ISO date string (YYYY-MM-DD)
  createdAt: string
}
