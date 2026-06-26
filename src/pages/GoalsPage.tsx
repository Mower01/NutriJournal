import React, { useState, useEffect } from 'react'
import { useNutritionStore } from '../store/useNutritionStore'
import { usePreferencesStore } from '../store/usePreferencesStore'
import { useSupabase } from '../hooks/useSupabase'
import type { Goals } from '../types'

const TDEE_CORRECTION = 0.92
const ACTIVITY_LEVELS = [
  { v: 1.2, l: 'Sédentaire' },
  { v: 1.375, l: 'Légèrement actif' },
  { v: 1.55, l: 'Modérément actif' },
  { v: 1.725, l: 'Très actif' },
  { v: 1.9, l: 'Extrêmement actif' },
]

function computeTDEE(sex: string, age: number, height: number, weight: number, activity: number) {
  let bmr = 0
  if (sex === 'H') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }
  return Math.round(bmr * activity * TDEE_CORRECTION)
}

export default function GoalsPage() {
  const { goals, setGoals } = useNutritionStore()
  const { darkForced, toggleDark, setDarkForced } = usePreferencesStore()
  const { user, signIn, signUp, signOut, syncToCloud, loadFromCloud } = useSupabase()

  // Goals form
  const [kcal, setKcal] = useState(String(goals.k || ''))
  const [gluc, setGluc] = useState(String(goals.g || ''))
  const [lip, setLip] = useState(String(goals.l || ''))
  const [prot, setProt] = useState(String(goals.p || ''))
  const [saved, setSaved] = useState(false)

  // Profile form (for TDEE calc)
  const [sex, setSex] = useState('H')
  const [age, setAge] = useState(30)
  const [height, setHeight] = useState(175)
  const [weight, setWeight] = useState(75)
  const [activity, setActivity] = useState(1.55)
  const [goalType, setGoalType] = useState('maintain')

  // Auth
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authMsg, setAuthMsg] = useState('')

  // Cloud sync
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncMsg, setSyncMsg] = useState('')

  // Sync goals when store changes
  useEffect(() => {
    setKcal(String(goals.k || ''))
    setGluc(String(goals.g || ''))
    setLip(String(goals.l || ''))
    setProt(String(goals.p || ''))
  }, [goals])

  function handleSaveGoals() {
    const g: Goals = {
      k: parseFloat(kcal) || 0,
      g: parseFloat(gluc) || 0,
      l: parseFloat(lip) || 0,
      p: parseFloat(prot) || 0,
    }
    setGoals(g)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleAutoFill() {
    const tdee = computeTDEE(sex, age, height, weight, activity)
    let targetKcal = tdee
    if (goalType === 'lose') targetKcal = tdee - 500
    if (goalType === 'gain') targetKcal = tdee + 300
    setKcal(String(targetKcal))
    setGluc(String(Math.round((targetKcal * 0.50) / 4)))
    setLip(String(Math.round((targetKcal * 0.30) / 9)))
    setProt(String(Math.round((targetKcal * 0.20) / 4)))
  }

  async function handleSignIn() {
    setAuthLoading(true); setAuthError(''); setAuthMsg('')
    try {
      await signIn(email, password)
      setAuthMsg('Connexion réussie !')
    } catch (e: any) {
      setAuthError(e.message || 'Erreur de connexion')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSignUp() {
    setAuthLoading(true); setAuthError(''); setAuthMsg('')
    try {
      await signUp(email, password, '')
      setAuthMsg('Compte créé ! Vérifiez votre email.')
    } catch (e: any) {
      setAuthError(e.message || 'Erreur de création')
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    setAuthMsg('Déconnecté.')
  }

  async function handleSync() {
    setSyncLoading(true); setSyncMsg('')
    try {
      await syncToCloud()
      setSyncMsg('Données synchronisées !')
    } catch (e: any) {
      setSyncMsg('Erreur : ' + e.message)
    } finally {
      setSyncLoading(false)
    }
  }

  async function handleLoad() {
    setSyncLoading(true); setSyncMsg('')
    try {
      await loadFromCloud()
      setSyncMsg('Données chargées depuis le cloud !')
    } catch (e: any) {
      setSyncMsg('Erreur : ' + e.message)
    } finally {
      setSyncLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '9px 10px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 14, background: 'var(--surface)', color: 'var(--tx)', outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { fontSize: 11, color: 'var(--tx2)', display: 'block' as const, marginBottom: 4, marginTop: 10 }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 700 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Mes objectifs</div>
      <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 24 }}>
        Objectifs nutritionnels · Profil · Compte & sync cloud
      </div>

      {/* Goals card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx)' }}>
          <i className="ti ti-target" style={{ color: 'var(--kcal)' }} />
          Objectifs nutritionnels quotidiens
        </div>
        <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 14, lineHeight: 1.6 }}>
          Ces valeurs servent de référence pour les barres de progression et les bilans.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }} className="goals-grid">
          {[
            { l: 'Calories (kcal)', v: kcal, set: setKcal, c: 'var(--kcal)', icon: 'ti-bolt' },
            { l: 'Glucides (g)', v: gluc, set: setGluc, c: 'var(--gluc)', icon: 'ti-grain' },
            { l: 'Lipides (g)', v: lip, set: setLip, c: 'var(--lip)', icon: 'ti-droplet' },
            { l: 'Protéines (g)', v: prot, set: setProt, c: 'var(--prot)', icon: 'ti-dna' },
          ].map(({ l, v, set, c, icon }) => (
            <div key={l}>
              <label style={{ ...labelStyle, marginTop: 0, color: c }}>
                <i className={`ti ${icon}`} style={{ marginRight: 5 }} />{l}
              </label>
              <input
                type="number" value={v} onChange={e => set(e.target.value)}
                min={0} style={{ ...inputStyle, color: c }}
              />
            </div>
          ))}
        </div>

        <button onClick={handleSaveGoals} className="btn btn-g">
          <i className="ti ti-check" />Enregistrer les objectifs
        </button>
        {saved && <span style={{ fontSize: 12, color: 'var(--ok)', marginLeft: 10 }}>✓ Objectifs enregistrés</span>}
      </div>

      {/* Profile / TDEE auto-fill */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx)' }}>
          <i className="ti ti-user" style={{ color: 'var(--gluc)' }} />
          Profil — Auto-calcul TDEE
        </div>
        <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 14, lineHeight: 1.6 }}>
          Renseignez votre profil pour calculer automatiquement vos objectifs caloriques et macros.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }} className="goals-grid">
          <div>
            <label style={labelStyle}>Sexe</label>
            <select value={sex} onChange={e => setSex(e.target.value)} style={inputStyle}>
              <option value="H">Homme</option>
              <option value="F">Femme</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Âge (ans)</label>
            <input type="number" value={age} onChange={e => setAge(+e.target.value)} min={10} max={100} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Taille (cm)</label>
            <input type="number" value={height} onChange={e => setHeight(+e.target.value)} min={100} max={250} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Poids (kg)</label>
            <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} min={20} max={300} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Niveau d'activité</label>
            <select value={activity} onChange={e => setActivity(+e.target.value)} style={inputStyle}>
              {ACTIVITY_LEVELS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Objectif</label>
            <select value={goalType} onChange={e => setGoalType(e.target.value)} style={inputStyle}>
              <option value="lose">Perte de poids (−500 kcal)</option>
              <option value="maintain">Maintien</option>
              <option value="gain">Prise de masse (+300 kcal)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleAutoFill} className="btn btn-g">
            <i className="ti ti-calculator" />Calculer & remplir
          </button>
          <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
            TDEE calculé : {computeTDEE(sex, age, height, weight, activity)} kcal/j (Mifflin-St Jeor ×{TDEE_CORRECTION})
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx)' }}>
          <i className="ti ti-palette" style={{ color: 'var(--lip)' }} />
          Apparence
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {[
            { l: 'Clair', icon: 'ti-sun', active: darkForced === false, onClick: () => setDarkForced(false) },
            { l: 'Sombre', icon: 'ti-moon', active: darkForced === true, onClick: () => setDarkForced(true) },
            { l: 'Système', icon: 'ti-device-laptop', active: darkForced === null, onClick: () => setDarkForced(null) },
          ].map((m) => (
            <button
              key={m.l}
              onClick={m.onClick}
              style={{
                flex: 1, padding: '9px 10px', border: `0.5px solid ${m.active ? 'var(--tx)' : 'var(--bd2)'}`,
                borderRadius: 'var(--r)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12,
                background: m.active ? 'var(--tx)' : 'none', color: m.active ? '#fff' : 'var(--tx2)',
                transition: 'all .15s', display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center',
              }}
            >
              <i className={`ti ${m.icon}`} />{m.l}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 8 }}>
          Mode actuel : {darkForced === true ? 'Sombre' : darkForced === false ? 'Clair' : 'Système'}
        </p>
      </div>

      {/* Account & Cloud sync */}
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx)' }}>
          <i className="ti ti-cloud" style={{ color: 'var(--prot)' }} />
          Compte & Synchronisation cloud
        </div>

        {user ? (
          <div>
            <div style={{ background: 'var(--bgluc)', borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--ok)', fontWeight: 600, marginBottom: 2 }}>
                <i className="ti ti-check" style={{ marginRight: 5 }} />Connecté
              </div>
              <div style={{ fontSize: 13, color: 'var(--tx)' }}>{user.email}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button onClick={handleSync} disabled={syncLoading} className="btn btn-g">
                <i className="ti ti-upload" />{syncLoading ? 'Sync…' : 'Sauvegarder'}
              </button>
              <button onClick={handleLoad} disabled={syncLoading} className="btn">
                <i className="ti ti-download" />{syncLoading ? '…' : 'Restaurer'}
              </button>
              <button onClick={handleSignOut} className="btn">
                <i className="ti ti-logout" />Déconnexion
              </button>
            </div>
            {syncMsg && (
              <div style={{ fontSize: 12, color: syncMsg.includes('Erreur') ? 'var(--danger)' : 'var(--ok)', padding: '4px 0' }}>
                {syncMsg}
              </div>
            )}
            <p style={{ fontSize: 11, color: 'var(--tx3)', lineHeight: 1.6, marginTop: 8 }}>
              La sauvegarde envoie toutes vos données vers Supabase. La restauration remplace vos données locales.
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 14, lineHeight: 1.6 }}>
              Connectez-vous pour synchroniser vos données entre appareils.
            </p>

            {/* Auth tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[
                { id: 'login', l: 'Connexion' },
                { id: 'register', l: 'Créer un compte' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setAuthTab(tab.id as any); setAuthError(''); setAuthMsg('') }}
                  style={{
                    padding: '6px 14px', fontSize: 13, border: '0.5px solid var(--bd2)',
                    borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
                    background: authTab === tab.id ? 'var(--tx)' : 'none',
                    color: authTab === tab.id ? '#fff' : 'var(--tx2)',
                    borderColor: authTab === tab.id ? 'var(--tx)' : 'var(--bd2)',
                  }}
                >
                  {tab.l}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@email.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
              />
            </div>

            {authTab === 'login' ? (
              <button onClick={handleSignIn} disabled={authLoading} className="btn btn-g">
                <i className="ti ti-login" />{authLoading ? 'Connexion…' : 'Se connecter'}
              </button>
            ) : (
              <button onClick={handleSignUp} disabled={authLoading} className="btn btn-g">
                <i className="ti ti-user-plus" />{authLoading ? 'Création…' : 'Créer un compte'}
              </button>
            )}

            {authError && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{authError}</div>}
            {authMsg && <div style={{ fontSize: 12, color: 'var(--ok)', marginTop: 8 }}>{authMsg}</div>}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 560px) {
          .goals-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
