'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { CleaningType } from '@/app/types'

export default function CleaningTypesPage() {
  const router = useRouter()
  const [types, setTypes] = useState<CleaningType[]>([])
  const [input, setInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editInput, setEditInput] = useState('')

  const load = async () => {
    setTypes(await localSupplyStorage.getCleaningTypes())
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    if (!input.trim()) return
    await localSupplyStorage.saveCleaningType({
      id: crypto.randomUUID(),
      name: input.trim(),
      createdAt: new Date().toISOString(),
    })
    setInput('')
    load()
  }

  const handleEdit = async (id: string) => {
    if (!editInput.trim()) return
    const type = types.find((t) => t.id === id)
    if (!type) return
    await localSupplyStorage.saveCleaningType({ ...type, name: editInput.trim() })
    setEditingId(null)
    load()
  }

  const handleDelete = async (id: string) => {
    await localSupplyStorage.deleteCleaningType(id)
    load()
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">청소 종류 관리</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="예: 쳇바퀴 소독"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:border-green-500 focus:outline-none shadow-sm"
        />
        <button
          onClick={handleAdd}
          className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm active:bg-green-700"
        >
          추가
        </button>
      </div>

      {types.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 shadow-sm">
          청소 종류를 추가해보세요
        </div>
      ) : (
        <ul className="space-y-2">
          {types.map((type) => (
            <li key={type.id} className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
              {editingId === type.id ? (
                <>
                  <input
                    type="text"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleEdit(type.id)}
                    autoFocus
                    className="flex-1 rounded-lg border border-green-400 px-2 py-1 text-sm focus:outline-none"
                  />
                  <button onClick={() => handleEdit(type.id)} className="text-xs text-green-600 font-medium">저장</button>
                  <button onClick={() => setEditingId(null)} className="text-xs text-gray-400">취소</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-gray-800">{type.name}</span>
                  <button
                    onClick={() => { setEditingId(type.id); setEditInput(type.name) }}
                    className="text-gray-300 hover:text-gray-500 transition-colors"
                    aria-label="수정"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="삭제"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
