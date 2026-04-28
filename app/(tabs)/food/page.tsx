'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { Food, FoodCategory } from '@/app/types'
import { getExpiryStatus, getExpiryLabel, getDaysUntilExpiry } from '@/app/utils/expiry'

export default function FoodPage() {
  const { selectedPetId } = usePet()
  const [foods, setFoods] = useState<Food[]>([])
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  const load = async () => {
    const [f, c] = await Promise.all([
      localSupplyStorage.getFoods(),
      localSupplyStorage.getCategories(),
    ])
    setFoods(f)
    setCategories(c)
  }

  useEffect(() => { load() }, [])

  const petFiltered = selectedPetId
    ? foods.filter((f) => f.petIds.length === 0 || f.petIds.includes(selectedPetId))
    : foods

  const filtered = selectedCategoryId
    ? petFiltered.filter((f) => f.categoryId === selectedCategoryId)
    : petFiltered

  const sorted = [...filtered].sort((a, b) => getDaysUntilExpiry(a.expiresAt) - getDaysUntilExpiry(b.expiresAt))

  const handleDelete = async (id: string) => {
    await localSupplyStorage.deleteFood(id)
    await load()
  }

  const statusBadge: Record<string, string> = {
    expired: 'bg-red-100/80 text-red-600',
    critical: 'bg-orange-100/80 text-orange-600',
    warning: 'bg-yellow-100/80 text-yellow-700',
    fresh: 'bg-green-100/80 text-green-600',
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">식품</h1>
          <div className="mt-1 flex shrink-0 gap-2">
            <Link
              href="/food/categories"
              className="rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm"
            >
              카테고리
            </Link>
            <Link
              href="/food/new"
              className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm"
              style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
            >
              + 추가
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5">
        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategoryId === null
                  ? 'bg-fg text-white'
                  : 'border border-white/60 bg-white/60 text-gray-500 backdrop-blur-sm'
              }`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategoryId === cat.id
                    ? 'bg-fg text-white'
                    : 'border border-white/60 bg-white/60 text-gray-500 backdrop-blur-sm'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* 식품 목록 */}
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
            <span className="mb-2 block text-2xl opacity-40">🥫</span>
            <p className="text-sm text-gray-400">
              {categories.length === 0
                ? '먼저 카테고리를 등록해주세요'
                : selectedPetId
                  ? '이 반려동물의 식품이 없어요'
                  : '등록된 식품이 없어요'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {sorted.map((food) => {
              const status = getExpiryStatus(food.expiresAt)
              const category = categories.find((c) => c.id === food.categoryId)
              return (
                <li
                  key={food.id}
                  className="flex items-center justify-between rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{food.name}</p>
                    {category && <p className="mt-0.5 text-xs text-gray-400">{category.name}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge[status]}`}>
                      {getExpiryLabel(food.expiresAt)}
                    </span>
                    <Link
                      href={`/food/new?id=${food.id}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
                      aria-label="수정"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
                      aria-label="삭제"
                    >
                      ×
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
