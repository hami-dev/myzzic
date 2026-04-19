'use client'

import { useRouter } from 'next/navigation'

export default function ThemePage() {
  const router = useRouter()

  return (
    <div className="px-4 py-6 space-y-6">
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
        <h1 className="text-xl font-bold text-gray-800">모드 변경</h1>
      </div>

      <ul className="space-y-2">
        <li className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-gray-800">라이트 모드</span>
          <span className="text-xs text-gray-400">준비 중</span>
        </li>
        <li className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-medium text-gray-800">다크 모드</span>
          <span className="text-xs text-gray-400">준비 중</span>
        </li>
      </ul>
    </div>
  )
}
