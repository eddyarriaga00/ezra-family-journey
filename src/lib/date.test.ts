import { describe, expect, it } from 'vitest'
import { toLocalDateInputValue } from './date'

describe('toLocalDateInputValue', () => {
  it('uses local calendar parts instead of UTC conversion', () => {
    const lateLocalTime = new Date(2026, 5, 18, 23, 45)
    expect(toLocalDateInputValue(lateLocalTime)).toBe('2026-06-18')
  })

  it('pads single-digit months and days', () => {
    expect(toLocalDateInputValue(new Date(2026, 0, 5, 12))).toBe('2026-01-05')
  })
})
