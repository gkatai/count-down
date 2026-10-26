import { expect, it } from 'vitest'
import { workdaysLeft, makeClassifier, type Config } from './workdays'

const base: Config = { targetDate: '2027-04-09', holidays: [], daysOff: [] }

it('counts today and target inclusive', () => {
  // Mon 2027-04-05 .. Fri 2027-04-09
  expect(workdaysLeft(base, new Date(2027, 3, 5))).toBe(5)
})
it('skips weekends', () => {
  expect(workdaysLeft(base, new Date(2027, 3, 3))).toBe(5) // Sat start
})
it('skips holidays and day-off ranges', () => {
  const c: Config = { ...base, holidays: ['2027-04-06'], daysOff: [{ from: '2027-04-07', to: '2027-04-08' }] }
  expect(workdaysLeft(c, new Date(2027, 3, 5))).toBe(2)
})
it('is 0 after target', () => {
  expect(workdaysLeft(base, new Date(2027, 3, 10))).toBe(0)
})
it('precedence: holiday > dayoff > weekend', () => {
  const c: Config = { ...base, holidays: ['2027-04-03'], daysOff: ['2027-04-03', '2027-04-04'] }
  const k = makeClassifier(c)
  expect(k(new Date(2027, 3, 3)).kind).toBe('holiday')
  expect(k(new Date(2027, 3, 4)).kind).toBe('dayoff')
})
