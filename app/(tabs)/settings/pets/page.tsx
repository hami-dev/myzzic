'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { Pet } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

const SPECIES_OPTIONS = ['강아지', '고양이', '햄스터', '토끼', '새', '기타']

const MODAL_COLORS = [
  '#F07878', '#4DCAAA', '#4A9CC8', '#E8906A', '#7CCAB8',
  '#F2D45C', '#A07CD4', '#7BBCE8', '#E8B882', '#7CC896',
]

function PetModal({
  title,
  initialName = '',
  initialSpecies = '',
  initialColor = MODAL_COLORS[0],
  submitLabel,
  onClose,
  onSubmit,
}: {
  title: string
  initialName?: string
  initialSpecies?: string
  initialColor?: string
  submitLabel: string
  onClose: () => void
  onSubmit: (name: string, species: string, color: string) => Promise<void>
}) {
  const [name, setName] = useState(initialName)
  const [species, setSpecies] = useState(initialSpecies)
  const [color, setColor] = useState(
    MODAL_COLORS.includes(initialColor) ? initialColor : MODAL_COLORS[0]
  )

  const handleSubmit = async () => {
    if (!name.trim()) return
    await onSubmit(name.trim(), species, color)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/85 px-6 pb-8 pt-6 shadow-xl backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label="닫기">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSubmit() }}
              placeholder="이름을 입력하세요"
              autoFocus
              className="w-full rounded-xl border border-white/60 bg-white/70 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 backdrop-blur-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">종류</label>
            <div className="grid grid-cols-3 gap-2">
              {SPECIES_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecies(species === s ? '' : s)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    species === s
                      ? 'border-accent bg-accent/10 text-accent-deep'
                      : 'border-white/60 bg-white/60 text-gray-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">식별 색상</label>
            <div className="grid grid-cols-5 gap-2">
              {MODAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-14 rounded-2xl transition-transform active:scale-95 ${
                    color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full rounded-2xl bg-fg py-4 text-sm font-semibold text-white disabled:opacity-40 active:opacity-80"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PetsPage() {
  const router = useRouter()
  const { pets, reload } = usePet()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  const handleAdd = async (name: string, species: string, color: string) => {
    try {
      await localSupplyStorage.savePet({
        id: crypto.randomUUID(),
        name,
        species: species || undefined,
        color,
        createdAt: new Date().toISOString(),
      })
      setIsAddOpen(false)
    } catch {
      alert('반려동물 추가에 실패했어요. 다시 시도해주세요.')
    } finally {
      await reload()
    }
  }

  const handleEdit = async (name: string, species: string, color: string) => {
    if (!editingPet) return
    try {
      await localSupplyStorage.savePet({ ...editingPet, name, species: species || undefined, color })
      setEditingPet(null)
    } catch {
      alert('수정에 실패했어요. 다시 시도해주세요.')
    } finally {
      await reload()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await localSupplyStorage.deletePet(id)
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
    } catch {
      alert('삭제에 실패했어요. 다시 시도해주세요.')
    } finally {
      await reload()
    }
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">반려동물 관리</h1>
          </div>
          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-1 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm"
            style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
          >
            + 추가
          </button>
        </div>
      </div>

      <div className="px-5">
        {pets.length === 0 ? (
          <div
            className="cursor-pointer rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm"
            onClick={() => setIsAddOpen(true)}
          >
            <span className="mb-2 block text-2xl opacity-40">🐾</span>
            <p className="text-sm text-gray-400">반려동물을 추가해보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {pets.map((pet) => (
              <li key={pet.id} className="flex items-center gap-2 rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm">
                <span className="h-4 w-4 shrink-0 rounded-full" style={{ backgroundColor: pet.color ?? DEFAULT_COLOR }} />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold text-gray-800">{pet.name}</span>
                  {pet.species && <span className="ml-1.5 text-xs text-gray-400">{pet.species}</span>}
                </div>
                <button
                  onClick={() => setEditingPet(pet)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
                  aria-label="수정"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(pet.id)}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
                  aria-label="삭제"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isAddOpen && (
        <PetModal
          title="새 반려동물 추가"
          submitLabel="추가하기"
          onClose={() => setIsAddOpen(false)}
          onSubmit={handleAdd}
        />
      )}

      {editingPet && (
        <PetModal
          key={editingPet.id}
          title="반려동물 수정"
          initialName={editingPet.name}
          initialSpecies={editingPet.species ?? ''}
          initialColor={editingPet.color ?? MODAL_COLORS[0]}
          submitLabel="저장하기"
          onClose={() => setEditingPet(null)}
          onSubmit={handleEdit}
        />
      )}
    </div>
  )
}
