export interface Meal {
  id: string
  n: string
  k: number
  g: number
  l: number
  p: number
  qty: number
  unit: string
  cat?: string
}

export interface DayData {
  meals: Meal[]
  supps: Record<string, boolean | { on: boolean; dose?: number }>
}

export interface Goals {
  k: number
  g: number
  l: number
  p: number
}

export interface Profile {
  sex: 'H' | 'F'
  age: number
  height: number
  weight: number
  activity: number
}

export interface Food {
  n: string
  c: string
  k: number
  g: number
  l: number
  p: number
  _custom?: boolean
}

export interface Supplement {
  id: string
  n: string
  cat: string
  desc: string
  pros: string[]
  cons: string[]
  dose: string
  source?: string
  protG?: number
}

export interface SuppDoseInfo {
  du: 'g' | 'mg' | 'µg' | string
  dd: number
  protPct?: number
}

export interface Totals {
  k: number
  g: number
  l: number
  p: number
}
