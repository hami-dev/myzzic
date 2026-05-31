'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { CleaningType } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'
import ColorPicker from '@/app/components/ColorPicker'
import { Input } from '@/app/components/Input'

function CleaningTypeForm() {
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

      <form onSubmit={handleSubmit} className="px-5">
        <div className="space-y-5 rounded-[22px] border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-sm">
          <div>
            <label className="mb-2.5 block text-sm font-semibold text-gray-700">색상</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">이름</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 쳇바퀴 소독"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              알림 주기 <span className="text-xs font-normal text-gray-400">(미입력 시 홈에 미노출)</span>
            </label>
            <div className="flex items-center gap-2.5">
              <Input
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                placeholder="예: 7"
                min="1"
                className="!w-24"
              />
              <span className="text-sm font-medium text-gray-600">일마다</span>
            </div>
          </div>

          {pets.length > 0 && (
            <div>
              <label className="mb-2.5 block text-sm font-semibold text-gray-700">반려동물</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPetId(null)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    petId === null
                      ? 'border-fg bg-fg text-white'
                      : 'border-white/60 bg-white/80 text-gray-600'
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
                      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? 'border-fg bg-fg text-white'
                          : 'border-white/60 bg-white/80 text-gray-600'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
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

        {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-2xl bg-accent py-4 text-[15px] font-semibold text-white"
          style={{ boxShadow: '0 4px 14px -4px rgba(232,144,106,0.6)' }}
        >
          {isEdit ? '저장' : '추가'}
        </button>
      </form>
    </div>
  )
}

export default function CleaningTypeFormPage() {
  return (
    <Suspense>
      <CleaningTypeForm />
    </Suspense>
  )
}
