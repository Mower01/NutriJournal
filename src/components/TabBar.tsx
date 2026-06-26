import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { usePreferencesStore } from '../store/usePreferencesStore'

const tabs = [
  { path: '/', label: 'Accueil', icon: 'ti-home-2', exact: true },
  { path: '/journal', label: 'Journal', icon: 'ti-fork-knife' },
  { path: '/supplements', label: 'Suppl.', icon: 'ti-pill' },
  { path: '/bilan', label: 'Bilans', icon: 'ti-chart-bar' },
]

const moreItems = [
  { path: '/foods', label: 'Base aliments', icon: 'ti-database', color: 'var(--gluc)' },
  { path: '/simulators', label: 'Simulateurs', icon: 'ti-calculator', color: 'var(--kcal)' },
  { path: '/goals', label: 'Mes objectifs', icon: 'ti-target', color: 'var(--prot)' },
]

export default function TabBar() {
  const [showMore, setShowMore] = useState(false)
  const { toggleDark, darkForced } = usePreferencesStore()
  const navigate = useNavigate()

  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = darkForced === null ? systemDark : darkForced

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
          }}
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More menu panel */}
      {showMore && (
        <div style={{
          position: 'fixed',
          bottom: `calc(var(--tabbar) + var(--safe-b))`,
          left: 0, right: 0,
          background: 'var(--surface)',
          borderTop: '0.5px solid var(--bd)',
          zIndex: 99,
          padding: '12px 14px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {moreItems.map(item => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setShowMore(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                  background: 'var(--s2)', border: 'none', borderRadius: 'var(--r)',
                  cursor: 'pointer', fontSize: 13, color: 'var(--tx)', fontFamily: 'inherit',
                }}
              >
                <i className={`ti ${item.icon}`} style={{ fontSize: 16, color: item.color }} />
                {item.label}
              </button>
            ))}
            <button
              onClick={() => { toggleDark(); setShowMore(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: 12,
                background: 'var(--s2)', border: 'none', borderRadius: 'var(--r)',
                cursor: 'pointer', fontSize: 13, color: 'var(--tx)', fontFamily: 'inherit',
              }}
            >
              <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} style={{ fontSize: 16, color: 'var(--lip)' }} />
              Mode sombre
            </button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <nav style={{
        display: 'none',
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--surface)', borderTop: '0.5px solid var(--bd)',
        paddingBottom: 'var(--safe-b)',
      }}
        className="tabbar-mobile"
      >
        <div style={{ display: 'flex', alignItems: 'stretch', height: 'var(--tabbar)' }}>
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.exact}
              onClick={() => setShowMore(false)}
              style={({ isActive }) => ({
                flex: 1,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                cursor: 'pointer',
                padding: '6px 4px',
                color: isActive ? 'var(--gluc)' : 'var(--tx3)',
                fontSize: 10,
                textDecoration: 'none',
                minWidth: 0,
                border: 'none',
                background: 'none',
                fontFamily: 'inherit',
              })}
            >
              <i className={`ti ${tab.icon}`} style={{ fontSize: 22 }} />
              <span style={{ fontSize: 10, letterSpacing: '-.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 52 }}>
                {tab.label}
              </span>
            </NavLink>
          ))}

          {/* Plus tab */}
          <button
            onClick={() => setShowMore(v => !v)}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, cursor: 'pointer',
              padding: '6px 4px', color: showMore ? 'var(--gluc)' : 'var(--tx3)',
              fontSize: 10, border: 'none', background: 'none', fontFamily: 'inherit',
            }}
          >
            <i className="ti ti-dots" style={{ fontSize: 22 }} />
            <span style={{ fontSize: 10 }}>Plus</span>
          </button>
        </div>
      </nav>
    </>
  )
}
