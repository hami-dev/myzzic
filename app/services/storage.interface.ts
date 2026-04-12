import type { Food, FoodCategory, CleaningType, CleaningRecord } from '@/app/types'

export interface ISupplyStorage {
  // Food categories
  getCategories(): Promise<FoodCategory[]>
  saveCategory(category: FoodCategory): Promise<void>
  deleteCategory(id: string): Promise<void>

  // Foods
  getFoods(): Promise<Food[]>
  saveFood(food: Food): Promise<void>
  deleteFood(id: string): Promise<void>

  // Cleaning types
  getCleaningTypes(): Promise<CleaningType[]>
  saveCleaningType(type: CleaningType): Promise<void>
  deleteCleaningType(id: string): Promise<void>

  // Cleaning records
  getCleaningRecords(): Promise<CleaningRecord[]>
  saveCleaningRecord(record: CleaningRecord): Promise<void>
  deleteCleaningRecord(id: string): Promise<void>
}
