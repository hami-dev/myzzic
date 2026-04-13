'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { CleaningType } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

export default function CleaningRecordPage() {
  const router = useRouter()
  const [types, setTypes] = useState<CleaningType[]>([])
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set())
  const [date, setDate] = useState(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  })
  const [error, setError] = useState('')

  useEffect(() => {
    localSupplyStorage.getCleaningTypes().then(setTypes)
  }, [])

  const toggleType = (id: string) => {
    setSelectedTypeIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTypeIds.size === 0) {
      setError('청소 종류를 하나 이상 선택해주세요')
      return
    }
    const existing = await localSupplyStorage.getCleaningRecords()
    const duplicates = [...selectedTypeIds].filter((typeId) =>
      existing.some((r) => r.cleaningTypeId === typeId && r.date === date)
    )
    if (duplicates.length > 0) {
      const duplicateNames = duplicates
        .map((id) => types.find((t) => t.id === id)?.name ?? id)
        .join(', ')
      setError(`이미 기록된 항목이 있어요: ${duplicateNames}`)
      return
    }
    const saveAll = [...selectedTypeIds].map((typeId) =>
      localSupplyStorage.saveCleaningRecord({
        id: crypto.randomUUID(),
        cleaningTypeId: typeId,
        date,
        createdAt: new Date().toISOString(),
      })
    )
    await Promise.all(saveAll)
    router.back()
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">청소 기록</h1>
      </div>

      {types.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-gray-500 mb-3">청소 종류를 먼저 등록해주세요</p>
          <button
            onClick={() => router.push('/care/types')}
            className="text-sm text-green-600 font-medium"
          >
            청소 종류 등록하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">청소 종류 (복수 선택 가능)</label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => {
                  const selected = selectedTypeIds.has(type.id)
                  const color = type.color ?? DEFAULT_COLOR
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggleType(type.id)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all border"
                      style={selected
                        ? { backgroundColor: color, borderColor: color, color: '#fff' }
                        : { backgroundColor: '#f3f4f6', borderColor: 'transparent', color: '#4b5563' }
                      }
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: selected ? '#fff' : color }}
                      />
                      {type.name}
                    </button>
                  )
                })}
              </div>
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
