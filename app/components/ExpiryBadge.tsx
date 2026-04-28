import { getExpiryStatus, getExpiryLabel } from '@/app/utils/expiry'
import type { ExpiryStatus } from '@/app/types'

const BADGE_STYLES: Record<ExpiryStatus, { badge: string; dot: string }> = {
  expired: { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  critical: { badge: 'bg-[#FDEAE3] text-[#C4593B]', dot: 'bg-[#E07553]' },
  warning: { badge: 'bg-[#FDF0E4] text-[#A07040]', dot: 'bg-[#D4A06A]' },
  fresh: { badge: 'bg-[#E5EDDA] text-[#5B7A47]', dot: 'bg-[#7BA866]' },
}

export default function ExpiryBadge({ expiresAt }: { expiresAt: string }) {
  const status = getExpiryStatus(expiresAt)
  const label = getExpiryLabel(expiresAt)
  const style = BADGE_STYLES[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  )
}
