'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { localSupplyStorage } from '@/app/services/localStorage'
import { usePet } from '@/app/context/PetContext'
import { DEFAULT_COLOR } from '@/app/utils/cleaning'
import { Input } from '@/app/components/Input'

function todayStr() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function NewMedicalForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { pets } = usePet()

  const editId = searchParams.get('id')
  const isEdit = !!editId

  const [petId, setPetId] = useState('')
  const [date, setDate] = useState(todayStr)
  const [hospital, setHospital] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [cost, setCost] = useState('')
  const [nextVisitDate, setNextVisitDate] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editId) {
      const load = async () => {
        const records = await localSupplyStorage.getMedicalRecords()
        const record = records.find((r) => r.id === editId)
        if (!record) {
          router.back()
          return
        }
        setPetId(record.petId)
        setDate(record.date)
        setHospital(record.hospital)
        setSymptoms(record.symptoms)
        setDiagnosis(record.diagnosis)
        setPrescription(record.prescription)
        setCost(record.cost != null ? String(record.cost) : '')
        setNextVisitDate(record.nextVisitDate ?? '')
      }
      load()
    } else if (pets.length === 1) {
      setPetId(pets[0].id)
    }
  }, [editId, router, pets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!petId || !date || !hospital.trim() || !symptoms.trim() || !diagnosis.trim() || !prescription.trim()) {
      setError('필수 항목을 모두 입력해주세요')
      return
    }
    const parsedCost = cost ? Number(cost) : undefined
    if (parsedCost !== undefined && (isNaN(parsedCost) || parsedCost < 0)) {
      setError('비용은 0 이상의 숫자를 입력해주세요')
      return
    }
    try {
      if (isEdit) {
        const records = await localSupplyStorage.getMedicalRecords()
        const existing = records.find((r) => r.id === editId)
        if (!existing) {
          setError('기록을 찾을 수 없어요')
          return
        }
        await localSupplyStorage.saveMedicalRecord({
          ...existing,
          petId,
          date,
          hospital: hospital.trim(),
          symptoms: symptoms.trim(),
          diagnosis: diagnosis.trim(),
          prescription: prescription.trim(),
          cost: parsedCost,
          nextVisitDate: nextVisitDate || undefined,
        })
      } else {
        await localSupplyStorage.saveMedicalRecord({
          id: crypto.randomUUID(),
          petId,
          date,
          hospital: hospital.trim(),
          symptoms: symptoms.trim(),
          diagnosis: diagnosis.trim(),
          prescription: prescription.trim(),
          cost: parsedCost,
          nextVisitDate: nextVisitDate || undefined,
          createdAt: new Date().toISOString(),
        })
      }
      router.back()
    } catch {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
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
          <h1 className="text-3xl font-bold tracking-tight text-fg">
            {isEdit ? '기록 수정' : '병원 기록'}
          </h1>
        </div>
      </div>

      {pets.length === 0 ? (
        <div className="mx-5 rounded-2xl border border-dashed border-white/60 bg-white/40 p-8 text-center backdrop-blur-sm">
          <span className="mb-2 block text-2xl opacity-40">🐾</span>
          <p className="mb-3 text-sm text-gray-500">반려동물을 먼저 등록해주세요</p>
          <button
            onClick={() => router.push('/settings/pets')}
            className="text-sm font-medium text-accent-deep"
          >
            반려동물 등록하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 px-5">
          <div className="space-y-4 rounded-[18px] border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
            {/* 반려동물 선택 */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">반려동물</label>
              <div className="flex flex-wrap gap-2">
                {pets.map((pet) => {
                  const selected = petId === pet.id
                  const color = pet.color ?? DEFAULT_COLOR
                  return (
                    <button
                      key={pet.id}
                      type="button"
                      onClick={() => setPetId(pet.id)}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                      style={selected
                        ? { backgroundColor: color, borderColor: color, color: '#fff' }
                        : { backgroundColor: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.5)', color: '#4b5563' }
                      }
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: selected ? '#fff' : color }} />
                      {pet.name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">방문일</label>
              <Input
                type="date"
                value={date}
                max={todayStr()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">병원명</label>
              <Input
                type="text"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="예: OO동물병원"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">증상</label>
              <Input
                type="text"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="예: 식욕 저하, 무기력"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">진단</label>
              <Input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="예: 감기"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">처방 / 약</label>
              <Input
                type="text"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="예: 항생제 3일분"
              />
            </div>
          </div>

          {/* 선택 항목 */}
          <div className="space-y-4 rounded-[18px] border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-sm">
            <p className="text-xs font-medium text-gray-400">선택 항목</p>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">비용</label>
              <Input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="예: 30000"
                min="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">다음 방문 예정일</label>
              <Input
                type="date"
                value={nextVisitDate}
                onChange={(e) => setNextVisitDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-center text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-accent py-3.5 text-sm font-semibold text-white"
            style={{ boxShadow: '0 4px 14px -4px rgba(242,184,162,0.6)' }}
          >
            {isEdit ? '저장' : '추가'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function NewMedicalPage() {
  return (
    <Suspense>
      <NewMedicalForm />
    </Suspense>
  )
}
