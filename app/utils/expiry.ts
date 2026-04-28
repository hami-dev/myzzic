import type { ExpiryStatus } from '@/app/types'

export function getDaysUntilExpiry(expiresAt: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiresAt)
  if (isNaN(expiry.getTime())) return 0
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getExpiryStatus(expiresAt: string): ExpiryStatus {
  const days = getDaysUntilExpiry(expiresAt)
  if (days < 0) return 'expired'
  if (days <= 7) return 'critical'
  if (days <= 14) return 'warning'
  return 'fresh'
}

export function getExpiryLabel(expiresAt: string): string {
  const days = getDaysUntilExpiry(expiresAt)
  if (days < 0) return `${Math.abs(days)}일 지남`
  if (days === 0) return '오늘 만료'
  return `D-${days}`
}

export const EXPIRY_CARD_BG: Record<ExpiryStatus, string> = {
  expired: 'bg-red-50/70',
  critical: 'bg-[#FDF3EF]/70',
  warning: 'bg-[#FDF7EF]/70',
  fresh: 'bg-[#F2F5EC]/70',
}
