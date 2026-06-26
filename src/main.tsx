import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize dark mode from localStorage before first render
const storedDark = localStorage.getItem('nj4dm')
if (storedDark) {
  try {
    const parsed = JSON.parse(storedDark)
    const darkForced = parsed?.state?.darkForced
    if (darkForced === true) {
      document.documentElement.classList.add('dark')
    } else if (darkForced === false) {
      document.documentElement.classList.remove('dark')
    }
  } catch {
    // ignore parse errors
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
