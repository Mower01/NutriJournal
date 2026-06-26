import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNutritionStore } from '../store/useNutritionStore'
import { useTotals, getTotalsForDate } from '../hooks/useTotals'
import { isSuppOn } from '../data/supplements'
import MacroGrid from '../components/MacroGrid'
import MacroRing from '../components/MacroRing'

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getDaysOfWeek(fromDate: string): string[] {
  const date = new Date(fromDate + 'T12:00:00')
  const dow = date.getDay()
  const monday = new Date(date)
  monday.setDate(date.getDate() - (dow === 0 ? 6 : dow - 1))
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

function getDaysOfMonth(fromDate: string): string[] {
  const date = new Date(fromDate + 'T12:00:00')
  const y = date.getFullYear()
  const m = date.getMonth()
  const dim = new Date(y, m + 1, 0).getDate()
  const days: string[] = []
  for (let i = 1; i <= dim; i++) {
    const d = new Date(y, m, i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

interface MiniBilanProps {
  period: 'week' | 'month'
  currentDate: string
  data: Record<string, any>
  goals: any
}

function MiniBilan({ period, currentDate, data, goals }: MiniBilanProps) {
  const days = period === 'week' ? getDaysOfWeek(currentDate) : getDaysOfMonth(currentDate)
  const gk = parseFloat(goals.k) || 0

  let totK = 0, totG = 0, totL = 0, totP = 0, dwd = 0
  const rows: { date: string; diff: number; type: string }[] = []

  days.forEach(d => {
    const day = data[d]
    if (!day?.meals?.length) return
    const t = getTotalsForDate(d, data)
    dwd++
    totK += t.k; totG += t.g; totL += t.l; totP += t.p
    if (gk > 0) {
      const diff = Math.round(t.k - gk)
      rows.push({ date: d, diff, type: diff < -100 ? 'deficit' : diff > 100 ? 'surplus' : 'ok' })
    }
  })

  if (dwd === 0) return <div style={{ fontSize: 12, color: 'var(--tx3)', padding: '8px 0' }}>Aucune donnée enregistrée.</div>

  const avg = {
    k: Math.round(totK / dwd),
    g: Math.round(totG / dwd),
    l: Math.round(totL / dwd),
    p: Math.round(totP / dwd),
  }
  const nD = rows.filter(r => r.type === 'deficit').length
  const nO = rows.filter(r => r.type === 'ok').length
  const nS = rows.filter(r => r.type === 'surplus').length

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
        {[
          { l: 'Moy. kcal', v: avg.k, c: 'var(--kcal)' },
          { l: 'Moy. protéines', v: `${avg.p}g`, c: 'var(--prot)' },
          { l: 'Moy. glucides', v: `${avg.g}g`, c: 'var(--gluc)' },
          { l: 'Moy. lipides', v: `${avg.l}g`, c: 'var(--lip)' },
        ].map(({ l, v, c }) => (
          <div key={l} style={{ background: 'var(--s2)', borderRadius: 'var(--r)', padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'var(--tx2)', marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      {gk > 0 && rows.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: 5, marginBottom: 8 }}>
            {[
              { l: 'Déficit', v: nD, c: 'var(--danger)', bg: 'var(--bprot)' },
              { l: 'Objectif', v: nO, c: 'var(--ok)', bg: 'var(--bgluc)' },
              { l: 'Surplus', v: nS, c: 'var(--warn)', bg: 'var(--blip)' },
            ].map(({ l, v, c, bg }) => (
              <div key={l} style={{ flex: 1, textAlign: 'center', background: 'var(--s2)', borderRadius: 'var(--r)', padding: '8px 10px' }}>
                <div style={{ fontSize: 10, color: 'var(--tx2)' }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
              </div>
            ))}
          </div>
          {(() => {
            const mx = Math.max(...rows.map(r => Math.abs(r.diff)), 1)
            return (
              <div>
                {rows.slice(-7).map(r => {
                  const pc = Math.min(100, Math.round(Math.abs(r.diff) / mx * 100))
                  const col = r.type === 'deficit' ? 'var(--danger)' : r.type === 'surplus' ? 'var(--warn)' : 'var(--ok)'
                  const bg = r.type === 'deficit' ? 'var(--bprot)' : r.type === 'surplus' ? 'var(--blip)' : 'var(--bgluc)'
                  const lbl = new Date(r.date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
                  const sign = r.diff > 0 ? '+' : ''
                  return (
                    <div key={r.date} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '0.5px solid var(--bd)' }}>
                      <div style={{ fontSize: 10, color: 'var(--tx3)', minWidth: 34 }}>{lbl}</div>
                      <div style={{ flex: 1, height: 7, borderRadius: 4, background: 'var(--s2)', overflow: 'hidden' }}>
                        <div style={{ width: `${pc}%`, height: '100%', borderRadius: 4, background: col }} />
                      </div>
                      <div style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 10, minWidth: 44, textAlign: 'center', background: bg, color: col }}>
                        {sign}{r.diff}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </>
      )}
      {!gk && <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Définissez un objectif pour l'analyse.</div>}
    </div>
  )
}

export default function HomePage() {
  const { currentDate, setDate, data, goals } = useNutritionStore()
  const totals = useTotals()
  const navigate = useNavigate()

  const suppsCount = Object.values(data[currentDate]?.supps || {}).filter(v => isSuppOn(v as any)).length

  function changeDay(d: number) {
    const date = new Date(currentDate + 'T12:00:00')
    date.setDate(date.getDate() + d)
    setDate(date.toISOString().split('T')[0])
  }

  const gk = parseFloat(String(goals.k)) || 0
  let bannerTitle = 'Commencez à enregistrer'
  let bannerSub = 'Ajoutez vos repas dans le Journal du jour'
  if (totals.k > 0) {
    if (gk > 0) {
      const pc = Math.round(totals.k / gk * 100)
      bannerTitle = `${pc}% de l'objectif`
      bannerSub = `${Math.round(totals.k)} / ${gk} kcal · ${Math.round(gk - totals.k)} restantes`
    } else {
      bannerTitle = `${Math.round(totals.k)} kcal consommées`
      bannerSub = 'Définissez un objectif dans Mes objectifs'
    }
  }

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      {/* Date bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Bonjour</div>
          <div style={{ fontSize: 13, color: 'var(--tx2)' }}>Tableau de bord nutritionnel</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => changeDay(-1)} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', padding: '7px 11px', cursor: 'pointer', color: 'var(--tx2)', fontSize: 14, transition: 'background .15s', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Jour précédent">
            <i className="ti ti-chevron-left" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 160, textAlign: 'center', color: 'var(--tx)' }}>
            {formatDate(currentDate)}
          </span>
          <button onClick={() => changeDay(1)} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', padding: '7px 11px', cursor: 'pointer', color: 'var(--tx2)', fontSize: 14, transition: 'background .15s', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Jour suivant">
            <i className="ti ti-chevron-right" />
          </button>
        </div>
      </div>

      {/* Banner */}
      <div
        onClick={() => navigate('/journal')}
        style={{
          borderRadius: 'var(--rx)', padding: '18px 22px', color: '#fff', marginBottom: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          background: 'linear-gradient(130deg, #2DBD8F, #1A9B72)', cursor: 'pointer',
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{bannerTitle}</h2>
          <p style={{ fontSize: 12, opacity: .88 }}>{bannerSub}</p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { v: Math.round(totals.k), l: 'kcal' },
            { v: `${Math.round(totals.p)}g`, l: 'protéines' },
            { v: suppsCount, l: 'suppléments' },
            { v: '→', l: 'Journal' },
          ].map(({ v, l }) => (
            <div key={l}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{v}</div>
              <div style={{ fontSize: 10, opacity: .8, marginTop: 1 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 10px' }}>
        Macronutriments du jour
      </div>
      <MacroGrid totals={totals} goals={goals} showGoalLabel />

      {/* Donut ring */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '24px 0 10px' }}>
        Répartition calorique
      </div>
      <MacroRing totals={totals} />

      {/* Weekly & monthly bilans */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '24px 0 10px' }}>
        Bilans
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="home-grid-resp">
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--kcal)' }}>
            <i className="ti ti-calendar-week" style={{ fontSize: 16 }} />
            Bilan semaine
          </div>
          <MiniBilan period="week" currentDate={currentDate} data={data} goals={goals} />
        </div>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--gluc)' }}>
            <i className="ti ti-calendar-month" style={{ fontSize: 16 }} />
            Bilan mois
          </div>
          <MiniBilan period="month" currentDate={currentDate} data={data} goals={goals} />
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .home-grid-resp { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
