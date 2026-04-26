'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import type { CleaningType } from '@/app/types'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

export default function CleaningTypesPage() {
  const router = useRouter()
  const { selectedPetId, pets } = usePet()
  const [types, setTypes] = useState<CleaningType[]>([])

  const load = async () => {
    const result = await localSupplyStorage.getCleaningTypes()
    setTypes(result)
  }

  useEffect(() => { load() }, [])

  const filteredTypes = selectedPetId
    ? types.filter((t) => !t.petId || t.petId === selectedPetId)
    : types

  const handleDelete = async (id: string) => {
    await localSupplyStorage.deleteCleaningType(id)
    await load()
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <div className="flex items-center justify-between">
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
            <h1 className="text-3xl font-bold tracking-tight text-fg">청소 종류 관리</h1>
          </div>
          <Link
            href="/care/types/form"
            className="rounded-full bg-accent px-3.5 py-1.5 text-xs font-medium text-white shadow-sm"
            style={{ boxShadow: '0 4px 14px -4px rgba(232,144,106,0.6)' }}
          >
            + 추가
          </Link>
        </div>
      </div>

      <div className="px-5">
        {filteredTypes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
            <span className="mb-2 block text-2xl opacity-40">🧹</span>
            <p className="text-sm text-gray-400">청소 종류를 추가해보세요</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredTypes.map((type) => {
              const ownerPet = pets.find((p) => p.id === type.petId)
              return (
                <li key={type.id} className="flex items-center gap-2 rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: type.color ?? DEFAULT_COLOR }}
                  />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-gray-800">{type.name}</span>
                  {type.reminderDays && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent-deep">
                      {type.reminderDays}일
                    </span>
                  )}
                  {pets.length > 0 && (
                    <span className="text-xs text-gray-400">
                      {ownerPet ? ownerPet.name : '공통'}
                    </span>
                  )}
                  <Link
                    href={`/care/types/form?id=${type.id}`}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-gray-600"
                    aria-label="수정"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-black/5 hover:text-red-400"
                    aria-label="삭제"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
