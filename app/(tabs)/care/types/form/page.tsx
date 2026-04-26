'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { CleaningType } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'
import ColorPicker from '@/app/components/ColorPicker'

export default function CleaningTypeFormPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pets } = usePet()

  const editId = searchParams.get('id')
  const isEdit = !!editId

  const [name, setName] = useState('')
  const [color, setColor] = useState(DEFAULT_COLOR)
  const [petId, setPetId] = useState<string | null>(null)
  const [reminderDays, setReminderDays] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editId) return
    const loadType = async () => {
      const types = await localSupplyStorage.getCleaningTypes()
      const type = types.find((t) => t.id === editId)
      if (!type) {
        router.back()
        return
      }
      setName(type.name)
      setColor(type.color ?? DEFAULT_COLOR)
      setPetId(type.petId ?? null)
      setReminderDays(type.reminderDays != null ? String(type.reminderDays) : '')
    }
    loadType()
  }, [editId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('이름을 입력해주세요')
      return
    }

    const days = parseInt(reminderDays)

    try {
      if (isEdit) {
        const types = await localSupplyStorage.getCleaningTypes()
        const existing = types.find((t) => t.id === editId)
        if (!existing) {
          setError('항목을 찾을 수 없어요')
          return
        }
        await localSupplyStorage.saveCleaningType({
          ...existing,
          name: name.trim(),
          color,
          petId: petId ?? undefined,
          reminderDays: days > 0 ? days : undefined,
        })
      } else {
        await localSupplyStorage.saveCleaningType({
          id: crypto.randomUUID(),
          name: name.trim(),
          color,
          petId: petId ?? undefined,
          reminderDays: days > 0 ? days : undefined,
          createdAt: new Date().toISOString(),
        })
      }
      router.back()
    } catch {
      setError('저장에 실패했어요. 다시 시도해주세요')
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
            {isEdit ? '청소 종류 수정' : '청소 종류 추가'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-5">
        <div className="space-y-4 rounded-[18px] border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">색상</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 쳇바퀴 소독"
              autoFocus
              className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              알림 주기 <span className="font-normal text-gray-400">(미입력 시 홈에 미노출)</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="예: 7"
                min="1"
                className="w-24 rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-accent focus:outline-none"
              />
              <span className="text-sm text-gray-400">일마다</span>
            </div>
          </div>

          {pets.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">반려동물</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPetId(null)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    petId === null
                      ? 'border-fg bg-fg text-white'
                      : 'border-white/60 bg-white/60 text-gray-500 backdrop-blur-sm'
                  }`}
                >
                  공통
                </button>
                {pets.map((pet) => {
                  const selected = petId === pet.id
                  const petColor = pet.color ?? DEFAULT_COLOR
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setPetId(pet.id)}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                      style={
                        selected
                          ? { backgroundColor: petColor, borderColor: petColor, color: '#fff' }
                          : { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.5)', color: '#4b5563' }
                      }
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: selected ? '#fff' : petColor }}
                      />
                      {pet.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-center text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-white"
          style={{ boxShadow: '0 4px 14px -4px rgba(232,144,106,0.6)' }}
        >
          {isEdit ? '저장' : '추가'}
        </button>
      </form>
    </div>
  )
}
