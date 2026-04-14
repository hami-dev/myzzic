'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { CleaningType } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'
import ColorPicker from '@/app/components/ColorPicker'

export default function CleaningTypesPage() {
  const router = useRouter()
  const { selectedPetId } = usePet()
  const [types, setTypes] = useState<CleaningType[]>([])
  const [input, setInput] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')
  const [editColor, setEditColor] = useState(DEFAULT_COLOR)

  const load = async () => {
    setTypes(await localSupplyStorage.getCleaningTypes())
  }

  useEffect(() => { load() }, [])

  // 선택된 Pet 기준 필터 (전체면 미귀속 포함 전체 표시)
  const filteredTypes = selectedPetId
    ? types.filter((t) => !t.petId || t.petId === selectedPetId)
    : types

  const handleAdd = async () => {
    if (!input.trim()) return
    await localSupplyStorage.saveCleaningType({
      id: crypto.randomUUID(),
      petId: selectedPetId ?? undefined,  // 선택된 Pet이 있으면 귀속
      name: input.trim(),
      color,
      createdAt: new Date().toISOString(),
    })
    setInput('')
    setColor(DEFAULT_COLOR)
    await load()
  }

  const handleEdit = async (id: string) => {
    if (!editInput.trim()) return
    const type = types.find((t) => t.id === id)
    if (!type) return
    await localSupplyStorage.saveCleaningType({ ...type, name: editInput.trim(), color: editColor })
    setEditingId(null)
    await load()
  }

  const handleDelete = async (id: string) => {
    await localSupplyStorage.deleteCleaningType(id)
    await load()
  }

  const startEdit = (type: CleaningType) => {
    setEditingId(type.id)
    setEditInput(type.name)
    setEditColor(type.color ?? DEFAULT_COLOR)
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">청소 종류 관리</h1>
      </div>

      {/* 추가 폼 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm mb-4 space-y-3">
        <ColorPicker value={color} onChange={setColor} />
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="예: 쳇바퀴 소독"
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
      {filteredTypes.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          청소 종류를 추가해보세요
        </div>
      ) : (
        <ul className="space-y-2">
          {filteredTypes.map((type) => (
            <li key={type.id} className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              {editingId === type.id ? (
                <div className="space-y-2">
                  <ColorPicker value={editColor} onChange={setEditColor} />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleEdit(type.id)}
                      autoFocus
                      className="flex-1 rounded-lg border border-green-400 px-2 py-1 text-sm focus:outline-none"
                    />
                    <button onClick={() => handleEdit(type.id)} className="text-xs text-green-600 font-medium">저장</button>
                    <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">취소</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: type.color ?? DEFAULT_COLOR }}
                  />
                  <span className="flex-1 text-sm font-medium text-gray-800">{type.name}</span>
                  <button
                    onClick={() => startEdit(type)}
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                    aria-label="수정"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
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
    </div>
  )
}
