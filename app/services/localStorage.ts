import type { Pet, Food, FoodCategory, CleaningType, CleaningRecord } from '@/app/types'
import type { ISupplyStorage } from './storage.interface'

// 네임스페이스 prefix('myzzic:')로 다른 앱의 localStorage 키와 충돌 방지
const KEYS = {
  pets: 'myzzic:pets',
  categories: 'myzzic:categories',
  foods: 'myzzic:foods',
  cleaningTypes: 'myzzic:cleaningTypes',
  cleaningRecords: 'myzzic:cleaningRecords',
  colorMigrated: 'myzzic:colorMigrated_v1',
} as const

const OLD_TO_NEW_COLOR: Record<string, string> = {
  '#ef4444': '#F2B8A2',
  '#f97316': '#D4B896',
  '#eab308': '#B0C4DE',
  '#22c55e': '#B5C9A8',
  '#3b82f6': '#C3B1D6',
  '#8b5cf6': '#D6A5B8',
  '#ec4899': '#B8A99A',
  '#6b7280': '#7A7368',
}

function migrateColors(): void {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(KEYS.colorMigrated)) return

  const pets = read<Pet>(KEYS.pets)
  const types = read<CleaningType>(KEYS.cleaningTypes)
  let changed = false

  for (const pet of pets) {
    const mapped = pet.color ? OLD_TO_NEW_COLOR[pet.color.toLowerCase()] : undefined
    if (mapped) { pet.color = mapped; changed = true }
  }
  for (const type of types) {
    const mapped = type.color ? OLD_TO_NEW_COLOR[type.color.toLowerCase()] : undefined
    if (mapped) { type.color = mapped; changed = true }
  }

  try {
    if (changed) {
      write(KEYS.pets, pets)
      write(KEYS.cleaningTypes, types)
    }
  } catch {
    return
  }
  localStorage.setItem(KEYS.colorMigrated, '1')
}

/**
 * localStorage에서 JSON 배열을 읽어온다.
 * SSR(서버 사이드 렌더링) 환경에서는 window가 없으므로 빈 배열을 반환.
 * JSON 파싱 실패 시(데이터 손상 등) 빈 배열로 안전하게 복구.
 *
 * @param key - KEYS 상수에 정의된 localStorage 키
 * @returns 저장된 데이터 배열. 없거나 오류 시 빈 배열
 */
function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

/**
 * 데이터 배열을 JSON 직렬화해 localStorage에 저장한다.
 *
 * @param key - KEYS 상수에 정의된 localStorage 키
 * @param data - 저장할 데이터 배열
 */
function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

migrateColors()

/**
 * localStorage 기반 ISupplyStorage 구현체.
 * 추후 Supabase 전환 시 이 객체를 SupabaseSupplyStorage로 교체하면 됨.
 *
 * save* 메서드는 upsert 방식으로 동작:
 * - id가 이미 존재하면 덮어쓰기(update)
 * - 없으면 새로 추가(insert)
 */
export const localSupplyStorage: ISupplyStorage = {
  async getPets() {
    return read<Pet>(KEYS.pets)
  },
  async savePet(pet) {
    const list = read<Pet>(KEYS.pets)
    const idx = list.findIndex((p) => p.id === pet.id)
    if (idx >= 0) list[idx] = pet
    else list.push(pet)
    write(KEYS.pets, list)
  },
  async deletePet(id) {
    write(KEYS.pets, read<Pet>(KEYS.pets).filter((p) => p.id !== id))
  },

  async getCategories() {
    return read<FoodCategory>(KEYS.categories)
  },
  async saveCategory(category) {
    const list = read<FoodCategory>(KEYS.categories)
    const idx = list.findIndex((c) => c.id === category.id)
    if (idx >= 0) list[idx] = category
    else list.push(category)
    write(KEYS.categories, list)
  },
  async deleteCategory(id) {
    write(KEYS.categories, read<FoodCategory>(KEYS.categories).filter((c) => c.id !== id))
  },

  async getFoods() {
    return read<Food>(KEYS.foods)
  },
  async saveFood(food) {
    const list = read<Food>(KEYS.foods)
    const idx = list.findIndex((f) => f.id === food.id)
    if (idx >= 0) list[idx] = food
    else list.push(food)
    write(KEYS.foods, list)
  },
  async deleteFood(id) {
    write(KEYS.foods, read<Food>(KEYS.foods).filter((f) => f.id !== id))
  },

  async getCleaningTypes() {
    return read<CleaningType>(KEYS.cleaningTypes)
  },
  async saveCleaningType(type) {
    const list = read<CleaningType>(KEYS.cleaningTypes)
    const idx = list.findIndex((t) => t.id === type.id)
    if (idx >= 0) list[idx] = type
    else list.push(type)
    write(KEYS.cleaningTypes, list)
  },
  async deleteCleaningType(id) {
    write(KEYS.cleaningTypes, read<CleaningType>(KEYS.cleaningTypes).filter((t) => t.id !== id))
  },

  async getCleaningRecords() {
    return read<CleaningRecord>(KEYS.cleaningRecords)
  },
  async saveCleaningRecord(record) {
    const list = read<CleaningRecord>(KEYS.cleaningRecords)
    const idx = list.findIndex((r) => r.id === record.id)
    if (idx >= 0) list[idx] = record
    else list.push(record)
    write(KEYS.cleaningRecords, list)
  },
  async deleteCleaningRecord(id) {
    write(KEYS.cleaningRecords, read<CleaningRecord>(KEYS.cleaningRecords).filter((r) => r.id !== id))
  },
}
