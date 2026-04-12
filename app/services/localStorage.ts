import type { Food, FoodCategory, CleaningType, CleaningRecord } from '@/app/types'
import type { ISupplyStorage } from './storage.interface'

const KEYS = {
  categories: 'myzzic:categories',
  foods: 'myzzic:foods',
  cleaningTypes: 'myzzic:cleaningTypes',
  cleaningRecords: 'myzzic:cleaningRecords',
} as const

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data))
}

export const localSupplyStorage: ISupplyStorage = {
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
