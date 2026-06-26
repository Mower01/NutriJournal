import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useNutritionStore } from '../store/useNutritionStore'
import { getTotalsForDate } from '../hooks/useTotals'
import type { Goals } from '../types'

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

function computePeriod(days: string[], data: Record<string, any>, goals: Goals) {
  const gk = parseFloat(String(goals.k)) || 0
  const bars: { date: string; label: string; k: number; g: number; l: number; p: number; type: string }[] = []
  let totK = 0, totG = 0, totL = 0, totP = 0, dwd = 0
  let nD = 0, nO = 0, nS = 0

  days.forEach(d => {
    const day = data[d]
    if (!day?.meals?.length) return
    const t = getTotalsForDate(d, data)
    dwd++
    totK += t.k; totG += t.g; totL += t.l; totP += t.p
    const label = new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    let type = 'ok'
    if (gk > 0) {
      const diff = t.k - gk
      if (diff < -100) { type = 'deficit'; nD++ }
      else if (diff > 100) { type = 'surplus'; nS++ }
      else nO++
    }
    bars.push({ date: d, label, k: Math.round(t.k), g: Math.round(t.g), l: Math.round(t.l), p: Math.round(t.p), type })
  })

  const avg = dwd > 0
    ? { k: Math.round(totK / dwd), g: Math.round(totG / dwd), l: Math.round(totL / dwd), p: Math.round(totP / dwd) }
    : { k: 0, g: 0, l: 0, p: 0 }
  return { bars, avg, dwd, nD, nO, nS }
}

function CustomBarTooltip({ active, payload, label, goals }: any) {
  if (!active || !payload?.length) return null
  const gk = parseFloat(String(goals.k)) || 0
  const v = payload[0].value
  const diff = gk > 0 ? Math.round(v - gk) : null
  return (
    <div style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rx)', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 5, color: 'var(--tx)' }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--kcal)' }}>{v} kcal</div>
      {diff !== null && (
        <div style={{ fontSize: 11, marginTop: 3, color: diff > 100 ? 'var(--warn)' : diff < -100 ? 'var(--danger)' : 'var(--ok)' }}>
          {diff > 0 ? '+' : ''}{diff} vs objectif
        </div>
      )}
    </div>
  )
}

export default function BilanPage() {
  const { currentDate, data, goals } = useNutritionStore()
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  const days = period === 'week' ? getDaysOfWeek(currentDate) : getDaysOfMonth(currentDate)
  const { bars, avg, dwd, nD, nO, nS } = computePeriod(days, data, goals)

  const gk = parseFloat(String(goals.k)) || 0

  // Period label
  let periodLabel = ''
  if (period === 'week') {
    const [start, end] = [days[0], days[6]]
    periodLabel = `Semaine du ${new Date(start + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au ${new Date(end + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`
  } else {
    const m = new Date(currentDate + 'T12:00:00')
    periodLabel = m.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase())
  }

  function handlePrint() {
    window.print()
  }

  const barColor = (type: string) =>
    type === 'deficit' ? '#ef4444' : type === 'surplus' ? '#f59e0b' : '#2DBD8F'

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Bilans</div>
      <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 20 }}>Analyse hebdomadaire & mensuelle</div>

      {/* Period selector + print */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'week', label: 'Semaine', icon: 'ti-calendar-week' },
            { id: 'month', label: 'Mois', icon: 'ti-calendar-month' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setPeriod(tab.id as any)}
              style={{
                padding: '7px 14px', fontSize: 13, border: '0.5px solid var(--bd2)',
                borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                background: period === tab.id ? 'var(--tx)' : 'none',
                color: period === tab.id ? '#fff' : 'var(--tx2)',
                borderColor: period === tab.id ? 'var(--tx)' : 'var(--bd2)',
              }}
            >
              <i className={`ti ${tab.icon}`} style={{ marginRight: 5 }} />
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--tx2)' }}>{periodLabel}</div>
        <button onClick={handlePrint} className="btn" style={{ marginLeft: 'auto' }}>
          <i className="ti ti-printer" />Exporter PDF
        </button>
      </div>

      {dwd === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tx3)' }}>
          <i className="ti ti-chart-bar" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Aucune donnée pour cette période</div>
          <div style={{ fontSize: 13 }}>Ajoutez des repas dans le Journal pour voir votre bilan.</div>
        </div>
      ) : (
        <>
          {/* Averages */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
            Moyennes ({dwd} jour{dwd > 1 ? 's' : ''} enregistrés)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }} className="bilan-avg-grid">
            {[
              { l: 'Kcal / jour', v: avg.k, unit: '', c: 'var(--kcal)', bg: 'var(--bkcal)', goal: gk > 0 ? gk : null, icon: 'ti-bolt' },
              { l: 'Glucides / jour', v: avg.g, unit: 'g', c: 'var(--gluc)', bg: 'var(--bgluc)', goal: goals.g > 0 ? parseFloat(String(goals.g)) : null, icon: 'ti-grain' },
              { l: 'Lipides / jour', v: avg.l, unit: 'g', c: 'var(--lip)', bg: 'var(--blip)', goal: goals.l > 0 ? parseFloat(String(goals.l)) : null, icon: 'ti-droplet' },
              { l: 'Protéines / jour', v: avg.p, unit: 'g', c: 'var(--prot)', bg: 'var(--bprot)', goal: goals.p > 0 ? parseFloat(String(goals.p)) : null, icon: 'ti-dna' },
            ].map(({ l, v, unit, c, bg, goal, icon }) => {
              const pct = goal && goal > 0 ? Math.min(100, Math.round(v / goal * 100)) : null
              return (
                <div key={l} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rx)', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ background: bg, borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${icon}`} style={{ color: c, fontSize: 14 }} />
                    </div>
                    {pct !== null && (
                      <span style={{ fontSize: 10, fontWeight: 700, background: bg, color: c, padding: '2px 6px', borderRadius: 10, marginLeft: 'auto' }}>
                        {pct}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c, lineHeight: 1 }}>{v}<span style={{ fontSize: 13, fontWeight: 500 }}>{unit}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--tx2)', marginTop: 3 }}>{l}</div>
                  {goal !== null && (
                    <>
                      <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 6 }}>Objectif : {goal}{unit}</div>
                      <div style={{ height: 4, background: 'var(--s2)', borderRadius: 3, marginTop: 5, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 3, transition: 'width .4s' }} />
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Day type counts */}
          {gk > 0 && bars.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
                Répartition vs objectif
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  { l: 'Jours en déficit', v: nD, c: 'var(--danger)', bg: 'var(--bprot)', icon: 'ti-trending-down' },
                  { l: 'Jours dans objectif', v: nO, c: 'var(--ok)', bg: 'var(--bgluc)', icon: 'ti-check' },
                  { l: 'Jours en surplus', v: nS, c: 'var(--warn)', bg: 'var(--blip)', icon: 'ti-trending-up' },
                ].map(({ l, v, c, bg, icon }) => (
                  <div key={l} style={{ flex: 1, minWidth: 100, background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rx)', padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ background: bg, borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`ti ${icon}`} style={{ color: c, fontSize: 15 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: c, lineHeight: 1 }}>{v}</div>
                      <div style={{ fontSize: 10, color: 'var(--tx2)', marginTop: 2 }}>{l}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Bar chart */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
            Apport calorique journalier
          </div>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rx)', padding: '18px 10px 10px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bars} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'var(--tx3)' }}
                  axisLine={{ stroke: 'var(--bd)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'var(--tx3)' }}
                  axisLine={false}
                  tickLine={false}
                  width={36}
                />
                <Tooltip content={<CustomBarTooltip goals={goals} />} />
                {gk > 0 && (
                  <CartesianGrid
                    horizontal={true}
                    vertical={false}
                    stroke="transparent"
                  />
                )}
                <Bar dataKey="k" radius={[4, 4, 0, 0]} maxBarSize={32}>
                  {bars.map((entry) => (
                    <Cell key={entry.date} fill={barColor(entry.type)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            {gk > 0 && (
              <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--tx3)', marginTop: 4 }}>
                Objectif : {gk} kcal/jour
              </div>
            )}
          </div>

          {/* Macro breakdown table */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '24px 0 10px' }}>
            Détail journalier
          </div>
          <div style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--tx2)', background: 'var(--s2)', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--kcal)', background: 'var(--s2)', textAlign: 'right' }}>Kcal</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gluc)', background: 'var(--s2)', textAlign: 'right' }}>Gluc</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--lip)', background: 'var(--s2)', textAlign: 'right' }}>Lip</th>
                    <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--prot)', background: 'var(--s2)', textAlign: 'right' }}>Prot</th>
                    {gk > 0 && <th style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--tx2)', background: 'var(--s2)', textAlign: 'right' }}>Δ kcal</th>}
                  </tr>
                </thead>
                <tbody>
                  {bars.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 20, color: 'var(--tx3)', fontSize: 13 }}>Aucun jour enregistré.</td></tr>
                  ) : bars.map(b => {
                    const diff = gk > 0 ? Math.round(b.k - gk) : null
                    const col = b.type === 'deficit' ? 'var(--danger)' : b.type === 'surplus' ? 'var(--warn)' : 'var(--ok)'
                    return (
                      <tr key={b.date} style={{ borderBottom: '0.5px solid var(--bd)' }}>
                        <td style={{ padding: '7px 12px', fontSize: 12, color: 'var(--tx)' }}>
                          {new Date(b.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: 'var(--kcal)' }}>{b.k}</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--gluc)' }}>{b.g}g</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--lip)' }}>{b.l}g</td>
                        <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--prot)' }}>{b.p}g</td>
                        {gk > 0 && diff !== null && (
                          <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: col }}>
                            {diff > 0 ? '+' : ''}{diff}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <style>{`
        @media print {
          .sidebar-wrapper, .tabbar-mobile { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        @media (max-width: 640px) {
          .bilan-avg-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}
