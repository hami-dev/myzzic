'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { FoodCategory } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

export default function NewFoodPage() {
  const router = useRouter()
  const { pets } = usePet()
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set())
  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    localSupplyStorage.getCategories().then((list) => {
      setCategories(list)
      if (list.length > 0) setCategoryId(list[0].id)
    })
  }, [])

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !name.trim() || !expiresAt) {
      setError('모든 항목을 입력해주세요')
      return
    }
    try {
      await localSupplyStorage.saveFood({
        id: crypto.randomUUID(),
        petIds: [...selectedPetIds],
        categoryId,
        name: name.trim(),
        expiresAt,
        createdAt: new Date().toISOString(),
      })
      router.back()
    } catch {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">식품 추가</h1>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-3">카테고리를 먼저 등록해주세요</p>
          <button
            onClick={() => router.push('/food/categories')}
            className="text-sm text-green-600 font-medium"
          >
            카테고리 등록하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">

            {/* 반려동물 선택 (복수 가능, 등록된 Pet이 있을 때만 표시) */}
            {pets.length > 0 && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  반려동물 <span className="text-gray-400 font-normal">(선택 없음 = 공유)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {pets.map((pet) => {
                    const selected = selectedPetIds.has(pet.id)
                    const color = pet.color ?? DEFAULT_COLOR
                    return (
                      <button
                        key={pet.id}
                        type="button"
                        onClick={() => togglePet(pet.id)}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
                        style={selected
                          ? { backgroundColor: color, borderColor: color, color: '#fff' }
                          : { backgroundColor: '#f3f4f6', borderColor: 'transparent', color: '#4b5563' }
                        }
                      >
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: selected ? '#fff' : color }}
                        />
                        {pet.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">카테고리</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">식품 이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 해바라기씨"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">유통기한</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow-sm active:bg-green-700"
          >
            저장
          </button>
        </form>
      )}
    </div>
  )
}
