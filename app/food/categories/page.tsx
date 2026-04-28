'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { FoodCategory } from '@/app/types'
import { Input } from '@/app/components/Input'

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')

  const load = async () => {
    const list = await localSupplyStorage.getCategories()
    setCategories(list)
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!input.trim()) return
    await localSupplyStorage.saveCategory({
      id: crypto.randomUUID(),
      name: input.trim(),
      createdAt: new Date().toISOString(),
    })
    setInput('')
    load()
  }

  const handleEdit = async (id: string) => {
    if (!editInput.trim()) return
    const category = categories.find((c) => c.id === id)
    if (!category) return
    await localSupplyStorage.saveCategory({ ...category, name: editInput.trim() })
    setEditingId(null)
    load()
  }

  const handleDelete = async (id: string) => {
    const foods = await localSupplyStorage.getFoods()
    const related = foods.filter((f) => f.categoryId === id)
    if (related.length > 0) {
      const ok = window.confirm(`이 카테고리에 속한 식품 ${related.length}개도 함께 삭제됩니다. 계속할까요?`)
      if (!ok) return
      await Promise.all(related.map((f) => localSupplyStorage.deleteFood(f.id)))
    }
    await localSupplyStorage.deleteCategory(id)
    load()
  }

  return (
    <div className="relative pb-6">
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
          <h1 className="text-3xl font-bold tracking-tight text-fg">카테고리 관리</h1>
        </div>
      </div>

      <div className="space-y-4 px-5">
        {/* 추가 입력 */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="새 카테고리 이름"
            className="!flex-1 !w-auto"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm"
            style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
          >
            추가
          </button>
        </div>

        {/* 목록 */}
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
            <p className="text-sm text-gray-400">카테고리를 추가해보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-2 rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm">
                {editingId === cat.id ? (
                  <>
                    <Input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat.id)}
                      autoFocus
                      className="!flex-1 !w-auto !py-1 !px-2"
                    />
                    <button onClick={() => handleEdit(cat.id)} className="text-xs font-medium text-accent-deep">저장</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">취소</button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-semibold text-gray-800">{cat.name}</span>
                    <button
                      onClick={() => { setEditingId(cat.id); setEditInput(cat.name) }}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
                      aria-label="수정"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
                      aria-label="삭제"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
