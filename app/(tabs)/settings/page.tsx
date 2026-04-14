'use client'

import { useState } from 'react'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { Pet } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'
import ColorPicker from '@/app/components/ColorPicker'

export default function SettingsPage() {
  const { pets, reload } = usePet()
  const [input, setInput] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')
  const [editColor, setEditColor] = useState(DEFAULT_COLOR)

  const handleAdd = async () => {
    if (!input.trim()) return
    await localSupplyStorage.savePet({
      id: crypto.randomUUID(),
      name: input.trim(),
      color,
      createdAt: new Date().toISOString(),
    })
    setInput('')
    setColor(DEFAULT_COLOR)
    await reload()
  }

  const handleEdit = async (id: string) => {
    if (!editInput.trim()) return
    const pet = pets.find((p) => p.id === id)
    if (!pet) return
    await localSupplyStorage.savePet({ ...pet, name: editInput.trim(), color: editColor })
    setEditingId(null)
    await reload()
  }

  const handleDelete = async (id: string) => {
    // Pet 삭제 — 연관 데이터는 미귀속 상태로 보존
    await localSupplyStorage.deletePet(id)

    // Food.petIds, CleaningType.petId 병렬로 읽어서 id 제거
    const [foods, types] = await Promise.all([
      localSupplyStorage.getFoods(),
      localSupplyStorage.getCleaningTypes(),
    ])
    await Promise.all([
      ...foods
        .filter((f) => f.petIds?.includes(id))
        .map((f) => localSupplyStorage.saveFood({ ...f, petIds: (f.petIds ?? []).filter((pid) => pid !== id) })),
      ...types
        .filter((t) => t.petId === id)
        .map((t) => localSupplyStorage.saveCleaningType({ ...t, petId: undefined })),
    ])

    await reload()
  }

  const startEdit = (pet: Pet) => {
    setEditingId(pet.id)
    setEditInput(pet.name)
    setEditColor(pet.color ?? DEFAULT_COLOR)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800">설정</h1>

      {/* 반려동물 관리 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">반려동물</h2>

        {/* 추가 폼 */}
        <div className="rounded-2xl bg-white p-4 shadow-sm mb-3 space-y-3">
          <ColorPicker value={color} onChange={setColor} />
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="예: 코코, 햄순이"
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:bg-green-700"
            >
              추가
            </button>
          </div>
        </div>

        {/* 목록 */}
        {pets.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
            반려동물을 추가해보세요
          </div>
        ) : (
          <ul className="space-y-2">
            {pets.map((pet) => (
              <li key={pet.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                {editingId === pet.id ? (
                  <div className="space-y-2">
                    <ColorPicker value={editColor} onChange={setEditColor} />
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(pet.id)}
                        autoFocus
                        className="flex-1 rounded-lg border border-green-400 px-2 py-1 text-sm focus:outline-none"
                      />
                      <button onClick={() => handleEdit(pet.id)} className="text-xs text-green-600 font-medium">저장</button>
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">취소</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: pet.color ?? DEFAULT_COLOR }} />
                    <span className="flex-1 text-sm font-medium text-gray-800">{pet.name}</span>
                    <button
                      onClick={() => startEdit(pet)}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                      aria-label="수정"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(pet.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                      aria-label="삭제"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
