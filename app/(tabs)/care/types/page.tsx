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
  const { selectedPetId, pets } = usePet()
  const [types, setTypes] = useState<CleaningType[]>([])
  const [input, setInput] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [newPetId, setNewPetId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')
  const [editColor, setEditColor] = useState(DEFAULT_COLOR)

  const load = async () => {
    setTypes(await localSupplyStorage.getCleaningTypes())
  }

  useEffect(() => { load() }, [])

  // 선택된 Pet 기준 필터 (전체면 전체 표시)
  const filteredTypes = selectedPetId
    ? types.filter((t) => !t.petId || t.petId === selectedPetId)
    : types

  const handleAdd = async () => {
    if (!input.trim()) return
    await localSupplyStorage.saveCleaningType({
      id: crypto.randomUUID(),
      petId: newPetId ?? undefined,
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
          <h1 className="text-3xl font-bold tracking-tight text-fg">청소 종류 관리</h1>
        </div>
      </div>

      {/* 추가 폼 */}
      <div className="mx-5 mb-4 space-y-3 rounded-[18px] border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
        <ColorPicker value={color} onChange={setColor} />

        {/* 동물 선택 (펫이 있을 때만 표시) */}
        {pets.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setNewPetId(null)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                newPetId === null
                  ? 'bg-fg border-fg text-white'
                  : 'border-white/60 bg-white/60 text-gray-500 backdrop-blur-sm'
              }`}
            >
              공통
            </button>
            {pets.map((pet) => {
              const selected = newPetId === pet.id
              const petColor = pet.color ?? DEFAULT_COLOR
              return (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setNewPetId(pet.id)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors"
                  style={
                    selected
                      ? { backgroundColor: petColor, borderColor: petColor, color: '#fff' }
                      : { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.5)', color: '#4b5563' }
                  }
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: selected ? '#fff' : petColor }}
                  />
                  {pet.name}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="예: 쳇바퀴 소독"
            className="flex-1 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-accent focus:outline-none"
          />
          <button
            onClick={handleAdd}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:opacity-80"
          >
            추가
          </button>
        </div>
      </div>

      {/* 목록 */}
      {filteredTypes.length === 0 ? (
        <div className="mx-5 rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
          <span className="mb-2 block text-2xl opacity-40">🧹</span>
          <p className="text-sm text-gray-400">청소 종류를 추가해보세요</p>
        </div>
      ) : (
        <ul className="mx-5 space-y-2">
          {filteredTypes.map((type) => {
            const ownerPet = pets.find((p) => p.id === type.petId)
            return (
              <li key={type.id} className="rounded-[18px] border border-white/50 bg-white/60 px-4 py-3 shadow-sm backdrop-blur-sm">
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
                        className="flex-1 rounded-lg border border-accent bg-white/70 px-2 py-1 text-sm focus:outline-none"
                      />
                      <button onClick={() => handleEdit(type.id)} className="text-xs font-medium text-accent-deep">저장</button>
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
                    {/* 귀속 펫 표시 */}
                    {pets.length > 0 && (
                      <span className="text-xs text-gray-400 mr-1">
                        {ownerPet ? ownerPet.name : '공통'}
                      </span>
                    )}
                    <button
                      onClick={() => startEdit(type)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
                      aria-label="수정"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(type.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
                      aria-label="삭제"
                    >
                      ×
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
