import React from 'react'
import type { Totals, Goals } from '../types'

interface MacroGridProps {
  totals: Totals
  goals: Goals
  showGoalLabel?: boolean
}

interface MacroCardProps {
  icon: string
  value: number
  unit: string
  label: string
  goal: number
  color: string
  bgColor: string
  goalLabel?: string
}

function MacroCard({ icon, value, unit, label, goal, color, bgColor, goalLabel }: MacroCardProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0

  return (
    <div style={{
      background: 'var(--surface)',
      border: '0.5px solid var(--bd)',
      borderRadius: 'var(--rl)',
      padding: '13px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 14,
          background: bgColor, color,
        }}>
          <i className={`ti ${icon}`} />
        </div>
        <span style={{
          fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 6px',
          background: bgColor, color,
        }}>
          {goal > 0 ? `${pct}%` : '—'}
        </span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color }}>
        {Math.round(value)}{unit}
      </div>
      <div style={{ fontSize: 11, color: 'var(--tx2)' }}>
        {label}
        {goalLabel && <span style={{ color: 'var(--tx3)' }}> {goalLabel}</span>}
      </div>
      <div className="mc-bar">
        <div
          className="mc-fill"
          style={{ background: color, width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export default function MacroGrid({ totals, goals, showGoalLabel = false }: MacroGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10,
      marginBottom: 16,
    }}
      className="macro-grid-resp"
    >
      <MacroCard
        icon="ti-flame"
        value={totals.k}
        unit=""
        label="kcal"
        goal={goals.k}
        color="var(--kcal)"
        bgColor="var(--bkcal)"
        goalLabel={showGoalLabel && goals.k ? `/ ${goals.k}` : undefined}
      />
      <MacroCard
        icon="ti-wheat"
        value={totals.g}
        unit="g"
        label="glucides"
        goal={goals.g}
        color="var(--gluc)"
        bgColor="var(--bgluc)"
        goalLabel={showGoalLabel && goals.g ? `/ ${goals.g}g` : undefined}
      />
      <MacroCard
        icon="ti-droplet"
        value={totals.l}
        unit="g"
        label="lipides"
        goal={goals.l}
        color="var(--lip)"
        bgColor="var(--blip)"
        goalLabel={showGoalLabel && goals.l ? `/ ${goals.l}g` : undefined}
      />
      <MacroCard
        icon="ti-meat"
        value={totals.p}
        unit="g"
        label="protéines"
        goal={goals.p}
        color="var(--prot)"
        bgColor="var(--bprot)"
        goalLabel={showGoalLabel && goals.p ? `/ ${goals.p}g` : undefined}
      />
    </div>
  )
}
