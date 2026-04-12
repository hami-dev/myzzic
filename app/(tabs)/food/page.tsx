'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { Food, FoodCategory } from '@/app/types'
import { getExpiryStatus, getExpiryLabel, getDaysUntilExpiry } from '@/app/utils/expiry'

export default function FoodPage() {
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

  const filtered = selectedCategoryId
    ? foods.filter((f) => f.categoryId === selectedCategoryId)
    : foods

  const sorted = [...filtered].sort((a, b) => getDaysUntilExpiry(a.expiresAt) - getDaysUntilExpiry(b.expiresAt))

  const statusColors: Record<string, string> = {
    expired: 'bg-red-100 text-red-700 border-red-200',
    critical: 'bg-orange-100 text-orange-700 border-orange-200',
    warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    fresh: 'bg-white text-gray-800 border-gray-100',
  }

  const handleDelete = async (id: string) => {
    await localSupplyStorage.deleteFood(id)
    load()
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">식품</h1>
        <div className="flex gap-2">
          <Link href="/food/categories" className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            카테고리
          </Link>
          <Link href="/food/new" className="rounded-xl bg-green-600 px-3 py-1.5 text-xs text-white shadow-sm">
            + 추가
          </Link>
        </div>
      </div>

      {/* 카테고리 필터 */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategoryId === null ? 'bg-green-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedCategoryId === cat.id ? 'bg-green-600 text-white' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* 식품 목록 */}
      {sorted.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          {categories.length === 0
            ? '먼저 카테고리를 등록해주세요'
            : '등록된 식품이 없어요'}
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((food) => {
            const status = getExpiryStatus(food.expiresAt)
            const category = categories.find((c) => c.id === food.categoryId)
            return (
              <li
                key={food.id}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-sm ${statusColors[status]}`}
              >
                <div>
                  <p className="text-sm font-medium">{food.name}</p>
                  {category && <p className="text-xs text-gray-400 mt-0.5">{category.name}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    status === 'expired' ? 'bg-red-200 text-red-700' :
                    status === 'critical' ? 'bg-orange-200 text-orange-700' :
                    status === 'warning' ? 'bg-yellow-200 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {getExpiryLabel(food.expiresAt)}
                  </span>
                  <button
                    onClick={() => handleDelete(food.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="삭제"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
