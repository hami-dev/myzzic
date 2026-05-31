'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { MedicalRecord } from '@/app/types'
import { getDaysUntilExpiry } from '@/app/utils/expiry'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function NextVisitBadge({ date }: { date: string }) {
  const days = getDaysUntilExpiry(date)
  const label = days < 0 ? `${Math.abs(days)}일 지남` : days === 0 ? '오늘' : `${days}일 후`
  const color = days < 0 ? 'text-red-500 bg-red-50' : days <= 3 ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50'

  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${color}`}>
      재방문 {label}
    </span>
  )
}

export default function MedicalPage() {
  const { pets, selectedPetId } = usePet()
  const [records, setRecords] = useState<MedicalRecord[]>([])

  const load = async () => {
    const list = await localSupplyStorage.getMedicalRecords()
    setRecords(list)
  }

  useEffect(() => { load() }, [])

  const filtered = selectedPetId
    ? records.filter((r) => r.petId === selectedPetId)
    : records

  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleDelete = async (id: string) => {
    if (!confirm('이 기록을 삭제할까요?')) return
    await localSupplyStorage.deleteMedicalRecord(id)
    await load()
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">건강</h1>
          <Link
            href="/medical/new"
            className="mt-1 shrink-0 rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm"
            style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
          >
            + 기록
          </Link>
        </div>
      </div>

      <div className="px-5">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
            <span className="mb-2 block text-2xl opacity-40">🏥</span>
            <p className="text-sm text-gray-400">
              {selectedPetId ? '이 반려동물의 기록이 없어요' : '등록된 기록이 없어요'}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {sorted.map((record) => {
              const pet = pets.find((p) => p.id === record.petId)
              return (
                <li
                  key={record.id}
                  className="rounded-[18px] border border-white/50 bg-white/60 px-4 py-4 shadow-sm backdrop-blur-sm"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {pet && (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: pet.color ?? DEFAULT_COLOR }}
                        >
                          {pet.name[0]}
                        </div>
                      )}
                      <span className="text-xs text-gray-400">{formatDate(record.date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/medical/new?id=${record.id}`}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
                        aria-label="수정"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
                        aria-label="삭제"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-gray-800">{record.hospital}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{record.diagnosis}</p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {record.cost != null && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                        {record.cost.toLocaleString()}원
                      </span>
                    )}
                    {record.nextVisitDate && <NextVisitBadge date={record.nextVisitDate} />}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
