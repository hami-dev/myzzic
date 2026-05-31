'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { FoodCategory } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'
import { Input, Select } from '@/app/components/Input'

function NewFoodForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pets } = usePet()

  const editId = searchParams.get('id')
  const isEdit = !!editId

  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [selectedPetIds, setSelectedPetIds] = useState<Set<string>>(new Set())
  const [name, setName] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      const list = await localSupplyStorage.getCategories()
      setCategories(list)

      if (editId) {
        const foods = await localSupplyStorage.getFoods()
        const food = foods.find((f) => f.id === editId)
        if (!food) {
          router.back()
          return
        }
        setName(food.name)
        setCategoryId(food.categoryId)
        setExpiresAt(food.expiresAt)
        setSelectedPetIds(new Set(food.petIds))
      } else if (list.length > 0) {
        setCategoryId(list[0].id)
      }
    }
    load()
  }, [editId, router])

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
      if (isEdit) {
        const foods = await localSupplyStorage.getFoods()
        const existing = foods.find((f) => f.id === editId)
        if (!existing) {
          setError('항목을 찾을 수 없어요')
          return
        }
        await localSupplyStorage.saveFood({
          ...existing,
          petIds: [...selectedPetIds],
          categoryId,
          name: name.trim(),
          expiresAt,
        })
      } else {
        await localSupplyStorage.saveFood({
          id: crypto.randomUUID(),
          petIds: [...selectedPetIds],
          categoryId,
          name: name.trim(),
          expiresAt,
          createdAt: new Date().toISOString(),
        })
      }
      router.back()
    } catch {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="-ml-2 p-2 text-gray-500 hover:text-gray-700"
            aria-label="뒤로"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-fg">
            {isEdit ? '식품 수정' : '식품 추가'}
          </h1>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="mx-5 rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
          <span className="mb-2 block text-2xl opacity-40">🥫</span>
          <p className="mb-3 text-sm text-gray-500">카테고리를 먼저 등록해주세요</p>
          <button
            onClick={() => router.push('/food/categories')}
            className="text-sm font-medium text-accent-deep"
          >
            카테고리 등록하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 px-5">
          <div className="space-y-4 rounded-[18px] border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
            {/* 반려동물 선택 */}
            {pets.length > 0 && (
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-500">
                  반려동물 <span className="font-normal text-gray-400">(선택 없음 = 공유)</span>
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
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                        style={selected
                          ? { backgroundColor: color, borderColor: color, color: '#fff' }
                          : { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.5)', color: '#4b5563' }
                        }
                      >
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: selected ? '#fff' : color }} />
                        {pet.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">카테고리</label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">식품 이름</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 해바라기씨"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">유통기한</label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-center text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-white"
            style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
          >
            {isEdit ? '저장' : '추가'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function NewFoodPage() {
  return (
    <Suspense>
      <NewFoodForm />
    </Suspense>
  )
}
