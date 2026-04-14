import BottomNav from '@/app/components/BottomNav'
import { PetProvider } from '@/app/context/PetContext'
import PetSelector from '@/app/components/PetSelector'

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PetProvider>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <PetSelector />
        <main className="flex-1 pb-16">{children}</main>
        <BottomNav />
      </div>
    </PetProvider>
  )
}
