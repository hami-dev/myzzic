'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { localSupplyStorage } from '@/app/services/localStorage'
import type { Pet } from '@/app/types'

type PetContextValue = {
  pets: Pet[]
  selectedPetId: string | null  // null = 전체 보기
  setSelectedPetId: (id: string | null) => void
  reload: () => Promise<void>
}

const PetContext = createContext<PetContextValue | null>(null)

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const list = await localSupplyStorage.getPets()
    setPets(list)
    // 선택된 Pet이 삭제된 경우 전체 보기로 초기화
    setSelectedPetId((prev) => (list.find((p) => p.id === prev) ? prev : null))
  }, [])

  useEffect(() => { reload() }, [reload])

  return (
    <PetContext.Provider value={{ pets, selectedPetId, setSelectedPetId, reload }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePet() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePet must be used within PetProvider')
  return ctx
}
