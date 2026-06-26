import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Supplement, Food } from '../types'

interface SupplementState {
  customSupps: Supplement[]
  customFoods: Food[]

  addCustomSupp: (supp: Supplement) => void
  deleteCustomSupp: (id: string) => void
  addCustomFood: (food: Food) => void
  deleteCustomFood: (name: string) => void
  setCustomSupps: (supps: Supplement[]) => void
  setCustomFoods: (foods: Food[]) => void
}

export const useSupplementStore = create<SupplementState>()(
  persist(
    (set) => ({
      customSupps: [],
      customFoods: [],

      addCustomSupp(supp) {
        set(state => ({ customSupps: [...state.customSupps, supp] }))
      },

      deleteCustomSupp(id) {
        set(state => ({ customSupps: state.customSupps.filter(s => s.id !== id) }))
      },

      addCustomFood(food) {
        set(state => ({ customFoods: [...state.customFoods, food] }))
      },

      deleteCustomFood(name) {
        set(state => ({ customFoods: state.customFoods.filter(f => f.n !== name) }))
      },

      setCustomSupps(supps) {
        set({ customSupps: supps })
      },

      setCustomFoods(foods) {
        set({ customFoods: foods })
      },
    }),
    {
      name: 'nj4cs',
      partialize: (state) => ({
        customSupps: state.customSupps,
        customFoods: state.customFoods,
      }),
    }
  )
)
