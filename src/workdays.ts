export type Entry = string | { date: string; label?: string } | { from: string; to: string; label?: string }
export interface Config { targetDate: string; holidays: Entry[]; daysOff: Entry[] }
export type Kind = 'holiday' | 'dayoff' | 'weekend' | 'workday'

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const parseISO = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** Expand entries into a map of ISO date -> label ('' if none). */
export function expand(entries: Entry[]): Map<string, string> {
  const out = new Map<string, string>()
  for (const e of entries) {
    if (typeof e === 'string') out.set(e, '')
    else if ('date' in e) out.set(e.date, e.label ?? '')
    else for (let d = parseISO(e.from); d <= parseISO(e.to); d = addDays(d, 1)) out.set(toISO(d), e.label ?? '')
  }
  return out
}

export function makeClassifier(config: Config) {
  const holidays = expand(config.holidays)
  const daysOff = expand(config.daysOff)
  return (d: Date): { kind: Kind; label: string } => {
    const iso = toISO(d)
    if (holidays.has(iso)) return { kind: 'holiday', label: holidays.get(iso)! }
    if (daysOff.has(iso)) return { kind: 'dayoff', label: daysOff.get(iso)! }
    if (d.getDay() === 0 || d.getDay() === 6) return { kind: 'weekend', label: '' }
    return { kind: 'workday', label: '' }
  }
}

/** Workdays from today to target, both inclusive. */
export function workdaysLeft(config: Config, today: Date): number {
  const classify = makeClassifier(config)
  const end = parseISO(config.targetDate)
  let n = 0
  for (let d = new Date(today.getFullYear(), today.getMonth(), today.getDate()); d <= end; d = addDays(d, 1))
    if (classify(d).kind === 'workday') n++
  return n
}
