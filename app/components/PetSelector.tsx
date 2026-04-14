'use client'

import { usePet } from '@/app/context/PetContext'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'

export default function PetSelector() {
  const { pets, selectedPetId, setSelectedPetId } = usePet()

  // Pet이 없으면 UI 미노출
  if (pets.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-gray-100 no-scrollbar">
      <button
        onClick={() => setSelectedPetId(null)}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selectedPetId === null
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 text-gray-500'
        }`}
      >
        전체
      </button>
      {pets.map((pet) => (
        <button
          key={pet.id}
          onClick={() => setSelectedPetId(pet.id === selectedPetId ? null : pet.id)}
          className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedPetId === pet.id
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: selectedPetId === pet.id ? '#fff' : (pet.color ?? DEFAULT_COLOR) }}
          />
          {pet.name}
        </button>
      ))}
    </div>
  )
}
