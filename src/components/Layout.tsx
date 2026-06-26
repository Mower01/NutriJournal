import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TabBar from './TabBar'
import { usePreferencesStore } from '../store/usePreferencesStore'

export default function Layout() {
  const { darkForced } = usePreferencesStore()

  // Apply dark mode class on mount and when preference changes
  useEffect(() => {
    if (darkForced === true) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else if (darkForced === false) {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else {
      // System preference
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.remove('light')
    }
  }, [darkForced])

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar — desktop only */}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>

      {/* Main content */}
      <main
        id="main"
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 'calc(var(--tabbar) + var(--safe-b))',
          background: 'var(--bg)',
        }}
        className="main-content"
      >
        <Outlet />
      </main>

      {/* Bottom tab bar — mobile only */}
      <TabBar />

      <style>{`
        @media (min-width: 768px) {
          .main-content { padding-bottom: 0 !important; }
          .tabbar-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .sidebar-wrapper { display: none; }
          .tabbar-mobile { display: block !important; }
        }
        .macro-grid-resp {
          grid-template-columns: repeat(4, 1fr);
        }
        @media (max-width: 640px) {
          .macro-grid-resp {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}
