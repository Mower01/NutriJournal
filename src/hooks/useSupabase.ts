import { useState, useEffect, useRef } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useNutritionStore } from '../store/useNutritionStore'
import { useSupplementStore } from '../store/useSupplementStore'

function getSupabase() {
  return supabase
}

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const nutritionStore = useNutritionStore()
  const supplementStore = useSupplementStore()

  useEffect(() => {
    const supa = getSupabase()
    supa.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadFromCloud()
    })

    const { data: listener } = supa.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        loadFromCloud()
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    const supa = getSupabase()
    const { error } = await supa.auth.signInWithPassword({ email, password })
    if (error) throw new Error(translateError(error.message))
  }

  async function signUp(email: string, password: string, name: string) {
    const supa = getSupabase()
    const { error } = await supa.auth.signUp({
      email,
      password,
      options: { data: { full_name: name || email } },
    })
    if (error) throw new Error(translateError(error.message))
  }

  async function signOut() {
    const supa = getSupabase()
    await supa.auth.signOut()
    setUser(null)
  }

  async function loadFromCloud() {
    const supa = getSupabase()
    const currentUser = (await supa.auth.getUser()).data.user
    if (!currentUser) return
    try {
      const { data: row, error } = await supa
        .from('user_data')
        .select('data')
        .eq('id', currentUser.id)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      if (row?.data) {
        const d = row.data
        if (d.meals) nutritionStore.setData(d.meals)
        if (d.goals) nutritionStore.setGoals(d.goals)
        if (d.customSupps) supplementStore.setCustomSupps(d.customSupps)
        if (d.customFoods) supplementStore.setCustomFoods(d.customFoods)
      }
    } catch (e) {
      console.error('loadFromCloud', e)
    }
  }

  async function syncToCloud() {
    const supa = getSupabase()
    const currentUser = (await supa.auth.getUser()).data.user
    if (!currentUser) return
    try {
      await supa.from('user_data').upsert(
        {
          id: currentUser.id,
          data: {
            meals: nutritionStore.data,
            goals: nutritionStore.goals,
            customSupps: supplementStore.customSupps,
            customFoods: supplementStore.customFoods,
          },
        },
        { onConflict: 'id' }
      )
    } catch (e) {
      console.error('syncToCloud', e)
    }
  }

  function scheduleSync() {
    if (!user) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(syncToCloud, 4000)
  }

  function translateError(msg: string): string {
    if (/invalid.*credentials/i.test(msg)) return 'E-mail ou mot de passe incorrect.'
    if (/email.*confirm/i.test(msg)) return 'Confirmez votre e-mail avant de vous connecter.'
    if (/already.*registered/i.test(msg)) return 'Un compte existe déjà avec cet e-mail.'
    if (/password.*6/i.test(msg)) return 'Le mot de passe doit contenir au moins 6 caractères.'
    return msg
  }

  return { user, loading, setLoading, signIn, signUp, signOut, syncToCloud, loadFromCloud, scheduleSync }
}
