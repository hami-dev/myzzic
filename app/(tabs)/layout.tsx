import BottomNav from '@/app/components/BottomNav'
import { PetProvider } from '@/app/context/PetContext'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PetProvider>
      {/* 배경 블롭 — 전 탭 공통 */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#F2B8A2] opacity-35 blur-3xl" />
        <div className="absolute right-0 top-36 h-72 w-72 rounded-full bg-[#C4B0DC] opacity-30 blur-3xl" />
        <div className="absolute bottom-52 left-4 h-64 w-64 rounded-full bg-[#F2C498] opacity-25 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-[#A0CC9C] opacity-25 blur-3xl" />
      </div>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-24">{children}</main>
        <BottomNav />
      </div>
    </PetProvider>
  )
}
