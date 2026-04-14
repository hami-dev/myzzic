'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { CleaningType, CleaningRecord } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

function todayStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// YYYY-MM-DD 형식이고 유효한 날짜인지 검증
function isValidDateStr(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime())
}

// 마지막 청소로부터 며칠 지났는지 계산
function daysSinceLastRecord(typeId: string, records: CleaningRecord[]): number | null {
  const last = records
    .filter((r) => r.cleaningTypeId === typeId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  if (!last) return null
  return Math.max(0, Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24)))
}

function CleaningRecordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [types, setTypes] = useState<CleaningType[]>([])
  const [records, setRecords] = useState<CleaningRecord[]>([])
  const [selectedTypeIds, setSelectedTypeIds] = useState<Set<string>>(new Set())
  const [date, setDate] = useState(() => {
    // 캘린더에서 선택한 날짜가 있으면 그걸 사용, 없으면 오늘
    const fromCalendar = searchParams.get('date')
    if (fromCalendar && isValidDateStr(fromCalendar)) return fromCalendar
    return todayStr()
  })
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      localSupplyStorage.getCleaningTypes(),
      localSupplyStorage.getCleaningRecords(),
    ]).then(([t, r]) => {
      setTypes(t)
      setRecords(r)
    })
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
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 mb-2 block">청소 종류 (복수 선택 가능)</label>
              <ul className="space-y-1">
                {types.map((type) => {
                  const selected = selectedTypeIds.has(type.id)
                  const color = type.color ?? DEFAULT_COLOR
                  const days = daysSinceLastRecord(type.id, records)
                  const daysLabel = days === null ? '기록 없음' : days === 0 ? '오늘' : `${days}일 전`
                  return (
                    <li key={type.id}>
                      <button
                        type="button"
                        onClick={() => toggleType(type.id)}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                          selected ? 'bg-gray-100' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                        <span className="flex-1 text-left text-sm font-medium text-gray-800">{type.name}</span>
                        <span className="text-xs text-gray-400">{daysLabel}</span>
                        {/* 선택 시에만 체크 아이콘 표시 */}
                        {selected && (
                          <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
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

export default function CleaningRecordPage() {
  return (
    <Suspense>
      <CleaningRecordForm />
    </Suspense>
  )
}
