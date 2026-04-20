'use client'

import Link from 'next/link'

const menus = [
  { href: '/settings/pets', label: '반려동물 관리', icon: PawIcon },
  { href: '/settings/theme', label: '모드 변경', icon: ThemeIcon },
]

export default function SettingsPage() {
  return (
    <div className="relative pb-28">
      <div className="px-5 pb-4 pt-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">설정</h1>
      </div>

      <div className="px-5">
        <ul className="space-y-2">
          {menus.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 rounded-[18px] border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-sm transition-colors active:bg-white/80"
              >
                <Icon className="h-5 w-5 text-gray-500" />
                <span className="flex-1 text-sm font-semibold text-gray-800">{label}</span>
                <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PawIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5.5c0 1.38-.895 2.5-2 2.5S4 6.88 4 5.5 4.895 3 6 3s2 1.12 2 2.5zM20 5.5c0 1.38-.895 2.5-2 2.5s-2-1.12-2-2.5S17 3 18 3s2 1.12 2 2.5zM6 13c0 1.38-.895 2.5-2 2.5S2 14.38 2 13s.895-2.5 2-2.5S6 11.62 6 13zM22 13c0 1.38-.895 2.5-2 2.5s-2-1.12-2-2.5.895-2.5 2-2.5 2 1.12 2 2.5zM12 21c-3 0-5-2-5-4.5 0-2 2-3.5 2.5-4.5S11 9.5 12 9.5s2 1.5 2.5 2.5S17 14.5 17 16.5 15 21 12 21z" />
    </svg>
  )
}

function ThemeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}
