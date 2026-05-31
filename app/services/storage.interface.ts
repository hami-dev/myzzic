import type { Pet, Food, FoodCategory, CleaningType, CleaningRecord, MedicalRecord } from '@/app/types'

export interface ISupplyStorage {
  // Pets
  getPets(): Promise<Pet[]>
  savePet(pet: Pet): Promise<void>
  deletePet(id: string): Promise<void>

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

  // Medical records
  getMedicalRecords(): Promise<MedicalRecord[]>
  saveMedicalRecord(record: MedicalRecord): Promise<void>
  deleteMedicalRecord(id: string): Promise<void>
}
