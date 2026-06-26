import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DayData, Goals, Meal } from '../types'

interface NutritionState {
  data: Record<string, DayData>
  goals: Goals
  currentDate: string

  getDay: (date?: string) => DayData
  addMeal: (date: string, meal: Meal) => void
  removeMeal: (date: string, index: number) => void
  setGoals: (goals: Goals) => void
  setDate: (date: string) => void
  toggleSupp: (date: string, id: string, on: boolean) => void
  setSuppDose: (date: string, id: string, dose: number) => void
  setData: (data: Record<string, DayData>) => void
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      data: {},
      goals: { k: 2000, g: 250, l: 70, p: 150 },
      currentDate: todayISO(),

      getDay(date?: string) {
        const key = date || get().currentDate
        const existing = get().data[key]
        if (existing) return existing
        return { meals: [], supps: {} }
      },

      addMeal(date, meal) {
        set(state => {
          const day = state.data[date] || { meals: [], supps: {} }
          return {
            data: {
              ...state.data,
              [date]: { ...day, meals: [...day.meals, meal] },
            },
          }
        })
      },

      removeMeal(date, index) {
        set(state => {
          const day = state.data[date]
          if (!day) return state
          const meals = [...day.meals]
          meals.splice(index, 1)
          return {
            data: { ...state.data, [date]: { ...day, meals } },
          }
        })
      },

      setGoals(goals) {
        set({ goals })
        try {
          localStorage.setItem('nj4g', JSON.stringify(goals))
        } catch {}
      },

      setDate(date) {
        set({ currentDate: date })
      },

      toggleSupp(date, id, on) {
        set(state => {
          const day = state.data[date] || { meals: [], supps: {} }
          const cur = day.supps[id]
          let newVal: boolean | { on: boolean; dose?: number }
          if (typeof cur === 'object' && cur !== null) {
            newVal = { ...cur, on }
          } else {
            newVal = on
          }
          return {
            data: {
              ...state.data,
              [date]: { ...day, supps: { ...day.supps, [id]: newVal } },
            },
          }
        })
      },

      setSuppDose(date, id, dose) {
        set(state => {
          const day = state.data[date] || { meals: [], supps: {} }
          const cur = day.supps[id]
          const wasOn = cur === true || (typeof cur === 'object' && cur?.on)
          return {
            data: {
              ...state.data,
              [date]: {
                ...day,
                supps: { ...day.supps, [id]: { on: !!wasOn, dose } },
              },
            },
          }
        })
      },

      setData(data) {
        set({ data })
      },
    }),
    {
      name: 'nj4',
    }
  )
)
