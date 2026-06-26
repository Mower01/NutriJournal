import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        } else {
          // Fallback : laisser Supabase détecter le token dans le hash (#access_token=...)
          const { data, error: sessionError } = await supabase.auth.getSession()
          if (sessionError) throw sessionError
          if (!data.session) throw new Error('Aucune session trouvée dans l\'URL.')
        }

        navigate('/', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur d\'authentification.')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-content-center bg-[var(--bg)]">
        <div className="max-w-md w-full mx-auto p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-bold text-[var(--tx)] mb-2">Erreur de confirmation</h2>
          <p className="text-sm text-[var(--tx2)] mb-6">{error}</p>
          <button
            onClick={() => navigate('/goals', { replace: true })}
            className="px-6 py-2 rounded-lg bg-gluc text-white font-semibold text-sm"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin inline-block">⟳</div>
        <p className="text-sm text-[var(--tx2)] font-medium">Connexion en cours…</p>
      </div>
    </div>
  )
}
