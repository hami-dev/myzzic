'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { Food, CleaningType, CleaningRecord } from '@/app/types'
import { getExpiryStatus, getExpiryLabel, getDaysUntilExpiry } from '@/app/utils/expiry'
import { DEFAULT_COLOR, CLEANING_WARNING_DAYS, CLEANING_CAUTION_DAYS } from '@/app/utils/cleaning'

function toSummary(types: CleaningType[], records: CleaningRecord[], petId?: string) {
  return types
    .filter((type) => type.reminderDays != null)
    .map((type) => {
      const lastRecord = records
        .filter((r) => {
          if (r.cleaningTypeId !== type.id) return false
          if (petId) return r.petId === petId || !r.petId
          return true
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      const daysSince = lastRecord
        ? Math.max(0, Math.floor((Date.now() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24)))
        : null
      return { type, daysSince }
    })
    .filter(({ type, daysSince }) => daysSince === null || daysSince >= type.reminderDays!)
}

export default function HomePage() {
  const { selectedPetId, pets } = usePet()
  const [foods, setFoods] = useState<Food[]>([])
  const [cleaningTypes, setCleaningTypes] = useState<CleaningType[]>([])
  const [records, setRecords] = useState<CleaningRecord[]>([])

  useEffect(() => {
    Promise.all([
      localSupplyStorage.getFoods(),
      localSupplyStorage.getCleaningTypes(),
      localSupplyStorage.getCleaningRecords(),
    ]).then(([f, t, r]) => {
      setFoods(f)
      setCleaningTypes(t)
      setRecords(r)
    })
  }, [])

  const filteredFoods = useMemo(() =>
    selectedPetId
      ? foods.filter((f) => f.petIds.length === 0 || f.petIds.includes(selectedPetId))
      : foods,
    [foods, selectedPetId]
  )

  const urgentFoods = useMemo(() =>
    filteredFoods
      .filter((f) => ['expired', 'critical', 'warning'].includes(getExpiryStatus(f.expiresAt)))
      .sort((a, b) => getDaysUntilExpiry(a.expiresAt) - getDaysUntilExpiry(b.expiresAt)),
    [filteredFoods]
  )

  const isGrouped = !selectedPetId && pets.length > 1

  const cleaningSummary = useMemo(() => {
    if (isGrouped) return []
    const types = selectedPetId
      ? cleaningTypes.filter((t) => !t.petId || t.petId === selectedPetId)
      : cleaningTypes
    return toSummary(types, records, selectedPetId ?? undefined)
  }, [isGrouped, selectedPetId, cleaningTypes, records])

  const groupedCleaningSummary = useMemo(() => {
    if (!isGrouped) return []
    return pets.map((pet) => ({
      pet,
      items: toSummary(cleaningTypes.filter((t) => !t.petId || t.petId === pet.id), records, pet.id),
    }))
  }, [isGrouped, pets, cleaningTypes, records])

  const statusColors: Record<string, string> = {
    expired: 'bg-red-100/80 text-red-600',
    critical: 'bg-orange-100/80 text-orange-600',
    warning: 'bg-yellow-100/80 text-yellow-700',
    fresh: 'bg-green-100/80 text-green-600',
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">myzzic</h1>
      </div>

      <div className="space-y-6 px-5">
        {/* 유통기한 주의 섹션 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] font-bold text-gray-900">유통기한 주의</span>
            <Link href="/food" className="text-xs font-medium text-accent-deep">전체보기</Link>
          </div>
          {urgentFoods.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-6 text-center backdrop-blur-sm">
              <p className="text-sm text-gray-400">임박한 식품이 없어요</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {urgentFoods.map((food) => {
                const status = getExpiryStatus(food.expiresAt)
                return (
                  <li key={food.id} className="flex items-center justify-between rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm">
                    <span className="text-sm font-semibold text-gray-800">{food.name}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[status]}`}>
                      {getExpiryLabel(food.expiresAt)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* 청소 현황 섹션 */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[15px] font-bold text-gray-900">청소 현황</span>
            <Link href="/care" className="text-xs font-medium text-accent-deep">전체보기</Link>
          </div>
          {isGrouped ? (
            groupedCleaningSummary.every((g) => g.items.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-6 text-center backdrop-blur-sm">
                <p className="text-sm text-gray-400">청소 종류를 등록해보세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {groupedCleaningSummary.map(({ pet, items }) => (
                  <div key={pet.id}>
                    <div className="mb-2 flex items-center gap-2 px-1">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-white/50 text-[10px] font-bold text-white"
                        style={{ backgroundColor: pet.color ?? DEFAULT_COLOR }}
                      >
                        {pet.name[0]}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{pet.name}</span>
                    </div>
                    {items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 px-4 py-3 text-center backdrop-blur-sm">
                        <p className="text-sm text-gray-400">등록된 청소 종류가 없어요</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {items.map(({ type, daysSince }) => (
                          <CleaningItem key={type.id} type={type} daysSince={daysSince} />
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : cleaningSummary.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-6 text-center backdrop-blur-sm">
              <p className="text-sm text-gray-400">청소 종류를 등록해보세요</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cleaningSummary.map(({ type, daysSince }) => (
                <CleaningItem key={type.id} type={type} daysSince={daysSince} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function CleaningItem({ type, daysSince }: { type: CleaningType; daysSince: number | null }) {
  return (
    <li className="flex items-center justify-between rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: type.color ?? DEFAULT_COLOR }} />
        <span className="text-sm font-semibold text-gray-800">{type.name}</span>
      </div>
      <span className={`text-xs font-semibold ${
        daysSince === null ? 'text-gray-400' :
        daysSince >= CLEANING_WARNING_DAYS ? 'text-red-500' :
        daysSince >= CLEANING_CAUTION_DAYS ? 'text-orange-500' : 'text-[#7CC896]'
      }`}>
        {daysSince === null ? '기록 없음' : daysSince === 0 ? '오늘' : `${daysSince}일 전`}
      </span>
    </li>
  )
}
