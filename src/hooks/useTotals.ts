import { useNutritionStore } from '../store/useNutritionStore'
import { useSupplementStore } from '../store/useSupplementStore'
import { isSuppOn, getSuppDoseInfo, calcSuppProt } from '../data/supplements'
import type { Totals } from '../types'

export function useTotals(date?: string): Totals {
  const { data, currentDate } = useNutritionStore()
  const { customSupps } = useSupplementStore()

  const key = date || currentDate
  const day = data[key] || { meals: [], supps: {} }

  const totals: Totals = { k: 0, g: 0, l: 0, p: 0 }

  day.meals.forEach(m => {
    totals.k += m.k || 0
    totals.g += m.g || 0
    totals.l += m.l || 0
    totals.p += m.p || 0
  })

  Object.entries(day.supps || {}).forEach(([id, val]) => {
    if (!isSuppOn(val)) return
    const info = getSuppDoseInfo(id)
    if (!info.protPct) return
    const dose = typeof val === 'object' && val.dose ? val.dose : info.dd
    const prot = calcSuppProt(id, dose)
    if (prot) {
      totals.p += prot
      totals.k += prot * 4
    }
  })

  void customSupps // keep dependency

  return totals
}

export function getTotalsForDate(
  date: string,
  data: Record<string, { meals: any[]; supps: Record<string, any> }>
): Totals {
  const day = data[date] || { meals: [], supps: {} }
  const totals: Totals = { k: 0, g: 0, l: 0, p: 0 }

  day.meals.forEach((m: any) => {
    totals.k += m.k || 0
    totals.g += m.g || 0
    totals.l += m.l || 0
    totals.p += m.p || 0
  })

  Object.entries(day.supps || {}).forEach(([id, val]) => {
    if (!isSuppOn(val as any)) return
    const info = getSuppDoseInfo(id)
    if (!info.protPct) return
    const dose = typeof val === 'object' && (val as any).dose ? (val as any).dose : info.dd
    const prot = calcSuppProt(id, dose)
    if (prot) {
      totals.p += prot
      totals.k += prot * 4
    }
  })

  return totals
}
