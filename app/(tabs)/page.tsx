'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { Food, CleaningType, CleaningRecord } from '@/app/types'
import { getExpiryStatus, getExpiryLabel, getDaysUntilExpiry } from '@/app/utils/expiry'

export default function HomePage() {
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

  const urgentFoods = foods
    .filter((f) => ['expired', 'critical', 'warning'].includes(getExpiryStatus(f.expiresAt)))
    .sort((a, b) => getDaysUntilExpiry(a.expiresAt) - getDaysUntilExpiry(b.expiresAt))

  const cleaningSummary = cleaningTypes.map((type) => {
    const lastRecord = records
      .filter((r) => r.cleaningTypeId === type.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

    const daysSince = lastRecord
      ? Math.floor((Date.now() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24))
      : null

    return { type, daysSince }
  })

  const statusColors: Record<string, string> = {
    expired: 'bg-red-100 text-red-700',
    critical: 'bg-orange-100 text-orange-700',
    warning: 'bg-yellow-100 text-yellow-700',
    fresh: 'bg-green-100 text-green-700',
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-800">myzzic</h1>

      {/* 유통기한 임박 섹션 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">유통기한 주의</h2>
          <Link href="/food" className="text-xs text-green-600">전체보기</Link>
        </div>
        {urgentFoods.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-400 shadow-sm">
            임박한 식품이 없어요
          </div>
        ) : (
          <ul className="space-y-2">
            {urgentFoods.map((food) => {
              const status = getExpiryStatus(food.expiresAt)
              return (
                <li key={food.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm font-medium text-gray-800">{food.name}</span>
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">청소 현황</h2>
          <Link href="/care" className="text-xs text-green-600">전체보기</Link>
        </div>
        {cleaningSummary.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-400 shadow-sm">
            청소 종류를 등록해보세요
          </div>
        ) : (
          <ul className="space-y-2">
            {cleaningSummary.map(({ type, daysSince }) => (
              <li key={type.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <span className="text-sm font-medium text-gray-800">{type.name}</span>
                <span className={`text-xs font-semibold ${
                  daysSince === null ? 'text-gray-400' :
                  daysSince >= 14 ? 'text-red-500' :
                  daysSince >= 7 ? 'text-orange-500' : 'text-green-600'
                }`}>
                  {daysSince === null ? '기록 없음' : daysSince === 0 ? '오늘' : `${daysSince}일 전`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
