/**
 * expiry.ts 단위 테스트
 *
 * [날짜 mocking 이란?]
 * getDaysUntilExpiry, getExpiryStatus, getExpiryLabel 은 내부에서 `new Date()`로
 * "오늘 날짜"를 읽어온다. 테스트를 실행하는 날마다 결과가 달라지면 신뢰할 수 없으므로,
 * vi.setSystemTime()으로 "오늘"을 고정한 뒤 테스트한다.
 *
 * [경계값 기준 — getExpiryStatus]
 * - days < 0  → 'expired'  (이미 만료)
 * - days 0~7  → 'critical' (D-7 이하, 0 포함)
 * - days 8~14 → 'warning'  (D-8 ~ D-14)
 * - days >= 15 → 'fresh'   (D-15 이상)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getDaysUntilExpiry, getExpiryStatus, getExpiryLabel } from './expiry'

// ─────────────────────────────────────────────
// 헬퍼: "오늘 기준 N일 후" 날짜를 YYYY-MM-DD 문자열로 반환
// ─────────────────────────────────────────────
function daysFromToday(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  // toISOString()은 UTC 기준이라 로컬 날짜와 다를 수 있으므로 직접 포매팅
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─────────────────────────────────────────────
// 테스트 전에 시스템 시각을 2026-04-12 00:00:00 (KST 기준 자정)으로 고정.
// afterEach 에서 반드시 복원해야 다른 테스트에 영향을 주지 않는다.
// ─────────────────────────────────────────────
const FIXED_NOW = new Date('2026-04-12T00:00:00')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  // 가짜 타이머를 해제해 실제 시계로 복원
  vi.useRealTimers()
})

// ══════════════════════════════════════════════
// getDaysUntilExpiry
// ══════════════════════════════════════════════
describe('getDaysUntilExpiry', () => {
  it('만료일이 오늘이면 0을 반환한다', () => {
    // 오늘(2026-04-12)을 넣으면 남은 일수는 0
    expect(getDaysUntilExpiry('2026-04-12')).toBe(0)
  })

  it('만료일이 내일이면 1을 반환한다', () => {
    expect(getDaysUntilExpiry('2026-04-13')).toBe(1)
  })

  it('만료일이 7일 후면 7을 반환한다 (D-7 경계)', () => {
    // critical/warning 경계를 확인하기 위한 핵심 케이스
    expect(getDaysUntilExpiry('2026-04-19')).toBe(7)
  })

  it('만료일이 8일 후면 8을 반환한다 (warning 진입 경계)', () => {
    expect(getDaysUntilExpiry('2026-04-20')).toBe(8)
  })

  it('만료일이 14일 후면 14를 반환한다 (D-14 경계)', () => {
    expect(getDaysUntilExpiry('2026-04-26')).toBe(14)
  })

  it('만료일이 이미 지났으면 음수를 반환한다', () => {
    // 어제(2026-04-11) → -1
    expect(getDaysUntilExpiry('2026-04-11')).toBe(-1)
  })

  it('만료일이 오래 전이면 절댓값이 큰 음수를 반환한다', () => {
    // 10일 전 → -10
    expect(getDaysUntilExpiry('2026-04-02')).toBe(-10)
  })

  it('시각(시·분·초) 정보를 무시하고 날짜만 비교한다', () => {
    // 오늘 자정 이후 시각이 포함된 문자열도 0을 반환해야 한다
    // (함수 내부에서 setHours(0,0,0,0)으로 정규화하기 때문)
    expect(getDaysUntilExpiry('2026-04-12T23:59:59')).toBe(0)
  })
})

// ══════════════════════════════════════════════
// getExpiryStatus
// ══════════════════════════════════════════════
describe('getExpiryStatus', () => {
  it('만료일이 지나면 "expired"를 반환한다', () => {
    // days = -1 → expired
    expect(getExpiryStatus('2026-04-11')).toBe('expired')
  })

  it('만료 당일(D-0)은 "critical"을 반환한다', () => {
    // days = 0 → critical (0 <= 7 이므로)
    expect(getExpiryStatus('2026-04-12')).toBe('critical')
  })

  it('D-7 경계는 "critical"을 반환한다', () => {
    // days = 7 → critical (7 <= 7)
    expect(getExpiryStatus('2026-04-19')).toBe('critical')
  })

  it('D-8은 "warning"을 반환한다 (critical에서 warning으로 넘어가는 경계)', () => {
    // days = 8 → warning (8 > 7, 8 <= 14)
    expect(getExpiryStatus('2026-04-20')).toBe('warning')
  })

  it('D-14 경계는 "warning"을 반환한다', () => {
    // days = 14 → warning (14 <= 14)
    expect(getExpiryStatus('2026-04-26')).toBe('warning')
  })

  it('D-15는 "fresh"를 반환한다 (warning에서 fresh로 넘어가는 경계)', () => {
    // days = 15 → fresh (15 > 14)
    expect(getExpiryStatus('2026-04-27')).toBe('fresh')
  })

  it('만료일이 충분히 남아 있으면 "fresh"를 반환한다', () => {
    // days = 30 → fresh
    expect(getExpiryStatus('2026-05-12')).toBe('fresh')
  })
})

// ══════════════════════════════════════════════
// getExpiryLabel
// ══════════════════════════════════════════════
describe('getExpiryLabel', () => {
  it('만료 당일(D-0)은 "오늘 만료"를 반환한다', () => {
    expect(getExpiryLabel('2026-04-12')).toBe('오늘 만료')
  })

  it('내일 만료면 "D-1"을 반환한다', () => {
    expect(getExpiryLabel('2026-04-13')).toBe('D-1')
  })

  it('D-7 경계에서 "D-7"을 반환한다', () => {
    expect(getExpiryLabel('2026-04-19')).toBe('D-7')
  })

  it('D-14 경계에서 "D-14"를 반환한다', () => {
    expect(getExpiryLabel('2026-04-26')).toBe('D-14')
  })

  it('만료 1일 후에는 "1일 지남"을 반환한다', () => {
    // days = -1 → Math.abs(-1) = 1
    expect(getExpiryLabel('2026-04-11')).toBe('1일 지남')
  })

  it('만료 10일 후에는 "10일 지남"을 반환한다', () => {
    // days = -10 → Math.abs(-10) = 10
    expect(getExpiryLabel('2026-04-02')).toBe('10일 지남')
  })

  it('한 달 후 만료면 "D-30"을 반환한다', () => {
    expect(getExpiryLabel('2026-05-12')).toBe('D-30')
  })
})
