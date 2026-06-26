import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { usePreferencesStore } from '../store/usePreferencesStore'
import { useSupabase } from '../hooks/useSupabase'

interface AuthModalProps {
  onClose: () => void
}

function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, signIn, signUp, signOut } = useSupabase()

  async function handleSubmit() {
    setError('')
    setSuccess('')
    if (!email || !password) { setError('Veuillez remplir tous les champs.'); return }
    setLoading(true)
    try {
      if (mode === 'register') {
        await signUp(email, password, name)
        setSuccess('✓ Compte créé ! Vérifiez votre e-mail pour confirmer.')
      } else {
        await signIn(email, password)
        onClose()
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--surface)', borderRadius: 18, padding: '28px 24px',
        width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.25)', position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, background: 'var(--s2)', border: 'none',
            fontSize: 18, cursor: 'pointer', color: 'var(--tx3)', width: 32, height: 32,
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <i className="ti ti-x" />
        </button>

        {user ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%', background: 'var(--bgluc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'var(--gluc)', margin: '0 auto 10px', fontWeight: 700,
            }}>
              {(user.email?.[0] || '?').toUpperCase()}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>{user.email}</div>
            <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 18 }}>Compte NutriJournal</div>
            <div style={{
              fontSize: 11, background: 'var(--bgluc)', color: 'var(--gluc)',
              borderRadius: 20, padding: '4px 10px', display: 'inline-flex',
              alignItems: 'center', gap: 5, marginBottom: 16,
            }}>
              <i className="ti ti-cloud-check" /> Synchronisation active
            </div>
            <button
              onClick={() => { signOut(); onClose() }}
              style={{
                width: '100%', padding: 10, background: 'var(--s2)', color: 'var(--tx2)',
                border: '0.5px solid var(--bd2)', borderRadius: 9, fontSize: 13,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <i className="ti ti-logout" style={{ marginRight: 6 }} /> Se déconnecter
            </button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>Mon compte</div>
            <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 18 }}>Synchronisation multi-appareils</div>
            <div style={{ display: 'flex', borderBottom: '0.5px solid var(--bd)', marginBottom: 22, gap: 4 }}>
              {(['login', 'register'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)} style={{
                  padding: '8px 18px', fontSize: 13, fontWeight: 600, border: 'none',
                  background: 'none', cursor: 'pointer', color: mode === m ? 'var(--gluc)' : 'var(--tx3)',
                  borderBottom: mode === m ? '2.5px solid var(--gluc)' : '2.5px solid transparent',
                  marginBottom: -1, fontFamily: 'inherit', transition: 'all .15s',
                }}>
                  {m === 'login' ? 'Connexion' : 'Créer un compte'}
                </button>
              ))}
            </div>
            {error && (
              <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--bprot)', borderRadius: 7, padding: '8px 12px', marginBottom: 12 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ fontSize: 12, color: 'var(--gluc)', background: 'var(--bgluc)', borderRadius: 7, padding: '8px 12px', marginBottom: 12 }}>
                {success}
              </div>
            )}
            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--tx2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                  Prénom / Nom
                </label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Marie Dupont" autoComplete="name"
                  style={{ width: '100%', padding: '10px 13px', border: '1px solid var(--bd2)', borderRadius: 9, fontSize: 14, background: 'var(--s2)', color: 'var(--tx)', fontFamily: 'inherit', outline: 'none' }}
                />
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--tx2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Adresse e-mail
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@exemple.com" autoComplete="email"
                style={{ width: '100%', padding: '10px 13px', border: '1px solid var(--bd2)', borderRadius: 9, fontSize: 14, background: 'var(--s2)', color: 'var(--tx)', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--tx2)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                Mot de passe
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '10px 13px', border: '1px solid var(--bd2)', borderRadius: 9, fontSize: 14, background: 'var(--s2)', color: 'var(--tx)', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <button
              onClick={handleSubmit} disabled={loading}
              style={{
                width: '100%', padding: 12, background: 'var(--gluc)', color: '#fff',
                border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Chargement…' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
            </button>
            <div style={{ fontSize: 11, color: 'var(--tx3)', textAlign: 'center', marginTop: 12 }}>
              Vos données sont chiffrées et synchronisées en temps réel.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const navItems = [
  { path: '/', label: 'Accueil', icon: 'ti-home-2', exact: true },
  { path: '/journal', label: 'Journal du jour', icon: 'ti-fork-knife' },
  { path: '/foods', label: "Base d'aliments", icon: 'ti-database' },
  { path: '/supplements', label: 'Suppléments', icon: 'ti-pill' },
]

const analysisItems = [
  { path: '/bilan', label: 'Bilans', icon: 'ti-chart-bar' },
  { path: '/simulators', label: 'Simulateurs', icon: 'ti-calculator' },
]

const settingsItems = [
  { path: '/goals', label: 'Mes objectifs', icon: 'ti-target' },
]

export default function Sidebar() {
  const { darkForced, toggleDark } = usePreferencesStore()
  const [showAuth, setShowAuth] = useState(false)
  const { user } = useSupabase()

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = darkForced === null ? systemDark : darkForced

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 9,
    padding: '9px 18px',
    cursor: 'pointer',
    color: isActive ? 'var(--gluc)' : 'var(--tx2)',
    fontSize: 13,
    borderLeft: isActive ? '2.5px solid var(--gluc)' : '2.5px solid transparent',
    fontWeight: isActive ? 600 : 400,
    background: isActive ? 'var(--bgluc)' : 'transparent',
    textDecoration: 'none',
    transition: 'all .15s',
  })

  return (
    <>
      <nav style={{
        width: 'var(--sidebar)', flexShrink: 0, background: 'var(--surface)',
        borderRight: '0.5px solid var(--bd)', display: 'flex', flexDirection: 'column',
        gap: 2, padding: '20px 0 28px', position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto', zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px 22px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, background: 'var(--gluc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 19,
          }}>
            <i className="ti ti-salad" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>NutriJournal</div>
            <div style={{ fontSize: 9, color: 'var(--tx3)', letterSpacing: '.06em', textTransform: 'uppercase' }}>
              Suivi nutritionnel
            </div>
          </div>
        </div>

        {/* Principal */}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', padding: '12px 18px 4px' }}>
          Principal
        </div>
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.exact} style={navLinkStyle}>
            <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} />
            {item.label}
          </NavLink>
        ))}

        {/* Analyse */}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', padding: '12px 18px 4px' }}>
          Analyse
        </div>
        {analysisItems.map(item => (
          <NavLink key={item.path} to={item.path} style={navLinkStyle}>
            <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} />
            {item.label}
          </NavLink>
        ))}

        {/* Réglages */}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', padding: '12px 18px 4px' }}>
          Réglages
        </div>
        {settingsItems.map(item => (
          <NavLink key={item.path} to={item.path} style={navLinkStyle}>
            <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} />
            {item.label}
          </NavLink>
        ))}

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          style={{
            margin: 'auto 18px 0', display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 12px', background: 'var(--s2)', border: '0.5px solid var(--bd2)',
            borderRadius: 'var(--r)', cursor: 'pointer', fontSize: 12, color: 'var(--tx2)',
            fontFamily: 'inherit',
          }}
        >
          <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} />
          <span>{isDark ? 'Mode clair' : 'Mode sombre'}</span>
        </button>

        {/* Account button */}
        <button
          onClick={() => setShowAuth(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px',
            border: 'none', background: 'none', cursor: 'pointer', fontSize: 13,
            color: 'var(--tx2)', fontFamily: 'inherit', borderRadius: 8, width: '100%',
            textAlign: 'left', transition: 'background .12s',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: user ? 'var(--gluc)' : 'var(--tx3)',
          }} />
          <i className="ti ti-user-circle" />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user ? (user.email?.length ?? 0) > 22 ? user.email!.slice(0, 20) + '…' : user.email : 'Connexion'}
          </span>
        </button>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
