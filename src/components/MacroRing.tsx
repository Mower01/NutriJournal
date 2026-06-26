import React from 'react'
import type { Totals } from '../types'

interface MacroRingProps {
  totals: Totals
}

export default function MacroRing({ totals }: MacroRingProps) {
  const circ = 2 * Math.PI * 40
  const total = totals.k || 1
  const gKcal = totals.g * 4
  const lKcal = totals.l * 9
  const pKcal = totals.p * 4

  const gPct = gKcal / total
  const lPct = lKcal / total
  const pPct = pKcal / total

  const gDash = gPct * circ
  const lDash = lPct * circ
  const pDash = pPct * circ

  const lOff = -(gDash - 63)
  const pOff = lOff - lDash

  const gR = Math.round(gPct * 100)
  const lR = Math.round(lPct * 100)
  const pR = Math.round(pPct * 100)
  const isBalanced = totals.k > 0 && gR >= 40 && gR <= 55 && lR >= 30 && lR <= 40 && pR >= 15 && pR <= 25

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
          <svg viewBox="0 0 110 110" width="110" height="110">
            <circle cx="55" cy="55" r="40" fill="none" stroke="var(--s3)" strokeWidth="14" />
            <circle
              cx="55" cy="55" r="40" fill="none"
              stroke="var(--gluc)" strokeWidth="14"
              strokeDasharray={`${gDash} ${circ - gDash}`}
              strokeDashoffset={63}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s' }}
            />
            <circle
              cx="55" cy="55" r="40" fill="none"
              stroke="var(--lip)" strokeWidth="14"
              strokeDasharray={`${lDash} ${circ - lDash}`}
              strokeDashoffset={lOff}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s' }}
            />
            <circle
              cx="55" cy="55" r="40" fill="none"
              stroke="var(--prot)" strokeWidth="14"
              strokeDasharray={`${pDash} ${circ - pDash}`}
              strokeDashoffset={pOff}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s' }}
            />
          </svg>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none'
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: 'var(--tx)' }}>
              {Math.round(totals.k)}
            </div>
            <div style={{ fontSize: 9, color: 'var(--tx3)', marginTop: 1 }}>kcal</div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gluc)', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx2)', flex: 1 }}>Glucides</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gluc)' }}>
              {totals.k > 0 ? `${Math.round(totals.g)}g (${gR}%)` : '— g'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--lip)', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx2)', flex: 1 }}>Lipides</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lip)' }}>
              {totals.k > 0 ? `${Math.round(totals.l)}g (${lR}%)` : '— g'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--prot)', flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx2)', flex: 1 }}>Protéines</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--prot)' }}>
              {totals.k > 0 ? `${Math.round(totals.p)}g (${pR}%)` : '— g'}
            </div>
          </div>
          <div style={{ marginTop: 4, paddingTop: 7, borderTop: '0.5px solid var(--bd)', fontSize: 11, color: 'var(--tx2)' }}>
            {totals.k === 0
              ? 'Ajoutez des aliments pour voir la répartition.'
              : isBalanced
                ? <span style={{ color: 'var(--ok)' }}>
                    <i className="ti ti-circle-check" style={{ marginRight: 4 }} />
                    Répartition équilibrée ANSES
                  </span>
                : 'Recommandations ANSES : Gluc 40–55% · Lip 30–40% · Prot 15–25%'
            }
          </div>
        </div>
      </div>
    </div>
  )
}
