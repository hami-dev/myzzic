'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { CleaningType, CleaningRecord } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일']
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

function toDateStr(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function CustomCalendar({
  value,
  onChange,
  recordColorsByDate,
}: {
  value: Date
  onChange: (date: Date) => void
  recordColorsByDate: Record<string, string[]>
}) {
  const [viewYear, setViewYear] = useState(value.getFullYear())
  const [viewMonth, setViewMonth] = useState(value.getMonth())

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Mon=0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const prevMonthLastDay = new Date(viewYear, viewMonth, 0).getDate()

    const result: Array<{ date: Date; isCurrentMonth: boolean }> = []
    for (let i = firstDayOfWeek - 1; i >= 0; i--)
      result.push({ date: new Date(viewYear, viewMonth - 1, prevMonthLastDay - i), isCurrentMonth: false })
    for (let d = 1; d <= daysInMonth; d++)
      result.push({ date: new Date(viewYear, viewMonth, d), isCurrentMonth: true })
    for (let d = 1; result.length < 42; d++)
      result.push({ date: new Date(viewYear, viewMonth + 1, d), isCurrentMonth: false })
    return result
  }, [viewYear, viewMonth])

  const todayStr = toDateStr(new Date())
  const selectedStr = toDateStr(value)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="mx-4 rounded-3xl border border-white/50 bg-white/55 p-4 shadow-sm backdrop-blur-md">
      {/* 내비게이션 */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[15px] font-semibold text-gray-800">
          <span className="mr-1 font-medium text-gray-400">{viewYear}년</span>{viewMonth + 1}월
        </div>
        <div className="flex gap-0.5">
          {([
            { label: '«', fn: () => setViewYear(y => y - 1) },
            { label: '‹', fn: prevMonth },
            { label: '›', fn: nextMonth },
            { label: '»', fn: () => setViewYear(y => y + 1) },
          ] as const).map(({ label, fn }) => (
            <button
              key={label}
              onClick={fn}
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-sm text-gray-400 transition-colors hover:bg-black/5"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div className="mb-1 grid grid-cols-7">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`py-1.5 text-center text-[11px] font-medium ${
              i === 5 ? 'text-sat' : i === 6 ? 'text-sun' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(({ date, isCurrentMonth }, i) => {
          const dateStr = toDateStr(date)
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedStr
          const col = i % 7
          const isSat = col === 5
          const isSun = col === 6
          const dots = recordColorsByDate[dateStr]

          const textColor =
            isSelected ? 'text-fg' :
            isToday ? 'text-fg' :
            isSat && isCurrentMonth ? 'text-sat' :
            isSun && isCurrentMonth ? 'text-sun' :
            !isCurrentMonth ? 'text-gray-300' :
            'text-gray-700'

          return (
            <button
              key={`${dateStr}-${i}`}
              onClick={() => onChange(date)}
              className={`flex flex-col items-center justify-center rounded-xl py-1.5 transition-all ${
                isSelected ? 'bg-accent/70' : isToday ? 'bg-accent/30' : 'hover:bg-black/5'
              } ${!isCurrentMonth ? 'opacity-30' : ''}`}
              style={
                isSelected
                  ? { boxShadow: '0 4px 12px -4px rgba(232,144,106,0.5)' }
                  : {}
              }
            >
              <span className={`text-[13px] font-medium leading-none ${textColor}`}>
                {date.getDate()}
              </span>
              <div className="mt-[4px] flex h-[5px] gap-[3px]">
                {dots?.slice(0, 4).map((color, ci) => (
                  <span
                    key={ci}
                    className="h-[5px] w-[5px] rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function CarePage() {
  const { pets } = usePet()

  const [cleaningTypes, setCleaningTypes] = useState<CleaningType[]>([])
  const [records, setRecords] = useState<CleaningRecord[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterPetId, setFilterPetId] = useState<string | null>(null)

  const load = async () => {
    const [types, recs] = await Promise.all([
      localSupplyStorage.getCleaningTypes(),
      localSupplyStorage.getCleaningRecords(),
    ])
    setCleaningTypes(types)
    setRecords(recs)
  }

  useEffect(() => { load() }, [])

  const recordColorsByDate = useMemo(() =>
    records.reduce<Record<string, string[]>>((acc, record) => {
      const type = cleaningTypes.find((t) => t.id === record.cleaningTypeId)
      if (!type) return acc
      const color = type.color ?? DEFAULT_COLOR
      if (!acc[record.date]) acc[record.date] = []
      acc[record.date].push(color)
      return acc
    }, {}),
    [records, cleaningTypes]
  )

  const selectedDateStr = toDateStr(selectedDate)

  const selectedRecords = useMemo(() =>
    records.filter((r) => {
      if (r.date !== selectedDateStr) return false
      if (filterPetId) return r.petId === filterPetId || !r.petId
      return true
    }),
    [records, selectedDateStr, filterPetId]
  )

  const groupedRecords = useMemo(() => {
    if (filterPetId || pets.length <= 1) return null
    return pets
      .map((pet) => ({
        pet,
        records: selectedRecords.filter((r) => r.petId === pet.id || !r.petId),
      }))
      .filter((g) => g.records.length > 0)
  }, [filterPetId, pets, selectedRecords])

  const handleDeleteRecord = async (id: string) => {
    await localSupplyStorage.deleteCleaningRecord(id)
    await load()
  }

  const dayName = DAY_NAMES[selectedDate.getDay()]
  const dayLabel = selectedDate.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  const isSunday = selectedDate.getDay() === 0
  const isSaturday = selectedDate.getDay() === 6

  return (
    <div className="relative pb-28">
      {/* 헤더 */}
      <div className="px-5 pb-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">청소</h1>
          </div>
          <div className="mt-1 flex shrink-0 gap-2">
            <Link
              href="/care/types"
              className="rounded-full border border-white/70 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm"
            >
              청소 관리
            </Link>
            <Link
              href={`/care/record?date=${selectedDateStr}`}
              className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm"
              style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
            >
              + 기록
            </Link>
          </div>
        </div>
      </div>

      {/* 커스텀 캘린더 */}
      <CustomCalendar
        value={selectedDate}
        onChange={setSelectedDate}
        recordColorsByDate={recordColorsByDate}
      />

      {/* 기록 섹션 */}
      <div className="mt-6 px-5">
        {/* 날짜 헤더 */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[15px] font-bold text-gray-900">{dayLabel} 기록</span>
            <span className={`text-sm font-medium ${isSunday ? 'text-sun' : isSaturday ? 'text-sat' : 'text-gray-400'}`}>
              · {dayName}요일
            </span>
          </div>
          {selectedRecords.length > 0 && (
            <span className="text-xs text-gray-400">{selectedRecords.length}건</span>
          )}
        </div>

        {/* 펫 필터 칩 */}
        {pets.length > 0 && (
          <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterPetId(null)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filterPetId === null
                  ? 'bg-fg text-white'
                  : 'border border-white/60 bg-white/60 text-gray-500 backdrop-blur-sm'
              }`}
            >
              전체
            </button>
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => setFilterPetId(filterPetId === pet.id ? null : pet.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  filterPetId === pet.id
                    ? 'bg-fg text-white'
                    : 'border border-white/60 bg-white/60 text-gray-600 backdrop-blur-sm'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: filterPetId === pet.id ? 'white' : (pet.color ?? DEFAULT_COLOR) }}
                />
                {pet.name}
              </button>
            ))}
          </div>
        )}

        {/* 기록 목록 */}
        {selectedRecords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
            <span className="mb-2 block text-2xl opacity-40">🐾</span>
            <p className="text-sm text-gray-400">이 날의 기록이 없어요</p>
          </div>
        ) : groupedRecords ? (
          <div className="space-y-5">
            {groupedRecords.map(({ pet, records: petRecords }) => (
              <div key={pet.id}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-white/50 text-xs font-bold text-white"
                      style={{ backgroundColor: pet.color ?? DEFAULT_COLOR }}
                    >
                      {pet.name[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                      {pet.name}
                      {pet.species && <span className="font-normal text-gray-400"> · {pet.species}</span>}
                    </span>
                  </div>
                  <span className="rounded-full border border-white/50 bg-white/50 px-2 py-0.5 text-xs text-gray-400 backdrop-blur-sm">
                    {petRecords.length}건
                  </span>
                </div>
                <ul className="space-y-2">
                  {petRecords.map((record) => (
                    <RecordItem key={record.id} record={record} cleaningTypes={cleaningTypes} onDelete={handleDeleteRecord} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {selectedRecords.map((record) => (
              <RecordItem key={record.id} record={record} cleaningTypes={cleaningTypes} onDelete={handleDeleteRecord} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function RecordItem({
  record,
  cleaningTypes,
  onDelete,
}: {
  record: CleaningRecord
  cleaningTypes: CleaningType[]
  onDelete: (id: string) => void
}) {
  const type = cleaningTypes.find((t) => t.id === record.cleaningTypeId)
  return (
    <li className="flex items-center justify-between rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: type?.color ?? DEFAULT_COLOR }} />
        <span className="text-sm font-semibold text-gray-800">{type?.name ?? '알 수 없음'}</span>
      </div>
      <button
        onClick={() => onDelete(record.id)}
        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
        aria-label="삭제"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  )
}
