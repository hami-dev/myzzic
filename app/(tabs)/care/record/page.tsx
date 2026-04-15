'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { CleaningType, CleaningRecord } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

function todayStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isValidDateStr(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime())
}

// 선택 키: "typeId::petId" 형식. petId 없으면 "typeId::"
function makeKey(typeId: string, petId?: string) {
  return `${typeId}::${petId ?? ''}`
}
function parseKey(key: string): { typeId: string; petId: string | undefined } {
  const idx = key.indexOf('::')
  if (idx === -1) return { typeId: key, petId: undefined }
  const typeId = key.slice(0, idx)
  const petId = key.slice(idx + 2) || undefined
  return { typeId, petId }
}

// 해당 (타입, 펫) 기준 마지막 청소 경과일
function daysSince(typeId: string, petId: string | undefined, records: CleaningRecord[]): number | null {
  const last = records
    .filter((r) => r.cleaningTypeId === typeId && (petId ? (r.petId === petId || !r.petId) : true))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  if (!last) return null
  return Math.max(0, Math.floor((Date.now() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24)))
}

function CleaningRecordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pets } = usePet()
  const [allTypes, setAllTypes] = useState<CleaningType[]>([])
  const [records, setRecords] = useState<CleaningRecord[]>([])
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [date, setDate] = useState(() => {
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
      setAllTypes(t)
      setRecords(r)
    })
  }, [])

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedKeys.size === 0) {
      setError('청소 종류를 하나 이상 선택해주세요')
      return
    }
    // 중복 체크: 같은 날 (typeId, petId) 조합이 이미 있는지
    const duplicates = [...selectedKeys].filter((key) => {
      const { typeId, petId } = parseKey(key)
      return records.some(
        (r) => r.cleaningTypeId === typeId && r.date === date && r.petId === petId
      )
    })
    if (duplicates.length > 0) {
      const names = duplicates.map((key) => {
        const { typeId, petId } = parseKey(key)
        const typeName = allTypes.find((t) => t.id === typeId)?.name ?? typeId
        const petName = pets.find((p) => p.id === petId)?.name
        return petName ? `${petName} · ${typeName}` : typeName
      }).join(', ')
      setError(`이미 기록된 항목이 있어요: ${names}`)
      return
    }
    try {
      await Promise.all(
        [...selectedKeys].map((key) => {
          const { typeId, petId } = parseKey(key)
          return localSupplyStorage.saveCleaningRecord({
            id: crypto.randomUUID(),
            cleaningTypeId: typeId,
            petId,
            date,
            createdAt: new Date().toISOString(),
          })
        })
      )
      router.back()
    } catch {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  const isGrouped = pets.length > 1

  // 펫별 그룹: 해당 펫 귀속 타입 + 공통 타입
  const groups = isGrouped
    ? pets.map((pet) => ({
        pet,
        types: allTypes.filter((t) => !t.petId || t.petId === pet.id),
      }))
    : [{ pet: pets[0] ?? null, types: allTypes }]

  const hasAnyTypes = groups.some((g) => g.types.length > 0)

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

      {!hasAnyTypes ? (
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
          {/* 날짜 */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">날짜</label>
            <input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* 펫별 그룹 */}
          <div className="space-y-3">
            {groups.map(({ pet, types }) => {
              if (types.length === 0) return null
              return (
                <div key={pet?.id ?? 'flat'} className="rounded-2xl bg-white p-4 shadow-sm">
                  {isGrouped && pet && (
                    <p className="text-xs font-semibold text-gray-400 mb-2">{pet.name}</p>
                  )}
                  <ul className="space-y-1">
                    {types.map((type) => {
                      const selKey = makeKey(type.id, pet?.id)
                      const selected = selectedKeys.has(selKey)
                      const color = type.color ?? DEFAULT_COLOR
                      const days = daysSince(type.id, pet?.id, records)
                      const daysLabel = days === null ? '기록 없음' : days === 0 ? '오늘' : `${days}일 전`
                      return (
                        <li key={selKey}>
                          <button
                            type="button"
                            onClick={() => toggleKey(selKey)}
                            className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                              selected ? 'bg-gray-100' : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="flex-1 text-left text-sm font-medium text-gray-800">{type.name}</span>
                            {selected ? (
                              <svg className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                              </svg>
                            ) : (
                              <span className="text-xs text-gray-400">{daysLabel}</span>
                            )}
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
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
