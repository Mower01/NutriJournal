import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  darkForced: boolean | null
  apiKey: string

  setDarkForced: (val: boolean | null) => void
  toggleDark: () => void
  setApiKey: (key: string) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      darkForced: null,
      apiKey: '',

      setDarkForced(val) {
        set({ darkForced: val })
        if (val === null) {
          document.documentElement.classList.remove('dark')
        } else if (val) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      toggleDark() {
        const current = get().darkForced
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const isCurrentlyDark = current === null ? systemDark : current
        const next = !isCurrentlyDark
        set({ darkForced: next })
        if (next) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },

      setApiKey(key) {
        set({ apiKey: key })
        try {
          localStorage.setItem('nj4ak', key)
        } catch {}
      },
    }),
    {
      name: 'nj4dm',
      partialize: (state) => ({ darkForced: state.darkForced, apiKey: state.apiKey }),
    }
  )
)
