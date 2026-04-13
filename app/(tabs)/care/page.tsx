'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { CleaningType, CleaningRecord } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

export default function CarePage() {
  const [cleaningTypes, setCleaningTypes] = useState<CleaningType[]>([])
  const [records, setRecords] = useState<CleaningRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const load = async () => {
    const [types, recs] = await Promise.all([
      localSupplyStorage.getCleaningTypes(),
      localSupplyStorage.getCleaningRecords(),
    ])
    setCleaningTypes(types)
    setRecords(recs)
  }

  useEffect(() => { load() }, [])

  const toDateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // 날짜에 기록 있는지 확인
  const recordDates = new Set(records.map((r) => r.date))

  const selectedDateStr = toDateStr(selectedDate)
  const selectedRecords = records.filter((r) => r.date === selectedDateStr)

  const handleDeleteRecord = async (id: string) => {
    await localSupplyStorage.deleteCleaningRecord(id)
    await load()
  }

  return (
    <div className="px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">청소</h1>
        <div className="flex gap-2">
          <Link href="/care/types" className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 shadow-sm">
            청소 종류
          </Link>
          <Link href="/care/record" className="rounded-xl bg-green-600 px-3 py-1.5 text-xs text-white shadow-sm">
            + 기록
          </Link>
        </div>
      </div>

      {/* 캘린더 */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <Calendar
          onChange={(value: Value) => {
            if (value instanceof Date) setSelectedDate(value)
          }}
          value={selectedDate}
          locale="ko-KR"
          formatDay={(_, date) => date.getDate().toString()}
          tileClassName={({ date }) => {
            const dateStr = toDateStr(date)
            return recordDates.has(dateStr) ? 'has-record' : null
          }}
          tileContent={({ date }) => {
            const dateStr = toDateStr(date)
            return recordDates.has(dateStr) ? (
              <div className="flex justify-center mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              </div>
            ) : null
          }}
        />
      </div>

      {/* 선택한 날짜의 기록 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 mb-2">
          {selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })} 기록
        </h2>
        {selectedRecords.length === 0 ? (
          <div className="rounded-2xl bg-white p-4 text-center text-sm text-gray-400 shadow-sm">
            이 날의 기록이 없어요
          </div>
        ) : (
          <ul className="space-y-2">
            {selectedRecords.map((record) => {
              const type = cleaningTypes.find((t) => t.id === record.cleaningTypeId)
              const typeName = type?.name ?? '알 수 없음'
              const color = type?.color ?? DEFAULT_COLOR
              return (
                <li key={record.id} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-gray-800">{typeName}</span>
                </div>
                <button
                  onClick={() => handleDeleteRecord(record.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="삭제"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
