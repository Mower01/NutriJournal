import React, { useState } from 'react'

const TDEE_CORRECTION = 0.92
const ACTIVITY_LEVELS = [
  { v: 1.2, l: 'Sédentaire (peu ou pas d\'exercice)' },
  { v: 1.375, l: 'Légèrement actif (1–3j/sem)' },
  { v: 1.55, l: 'Modérément actif (3–5j/sem)' },
  { v: 1.725, l: 'Très actif (6–7j/sem)' },
  { v: 1.9, l: 'Extrêmement actif (2x/jour)' },
]
const GOALS_LABELS = [
  { v: 'lose', l: 'Perdre du poids (-500 kcal/j)' },
  { v: 'maintain', l: 'Maintenir le poids' },
  { v: 'gain', l: 'Prendre de la masse (+300 kcal/j)' },
]

function computeTDEE(sex: string, age: number, height: number, weight: number, activity: number) {
  let bmr = 0
  if (sex === 'H') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161
  }
  const tdeeRaw = bmr * activity
  return { bmr: Math.round(bmr), tdee: Math.round(tdeeRaw * TDEE_CORRECTION) }
}

function computeProtein(weight: number, sex: string) {
  const anses = Math.round(0.83 * weight)
  const issn_lo = Math.round(1.6 * weight)
  const issn_hi = Math.round(2.2 * weight)
  const morton = Math.round(2.2 * weight)
  return { anses, issn_lo, issn_hi, morton }
}

export default function SimulatorsPage() {
  const [simTab, setSimTab] = useState<'tdee' | 'protein' | 'macros' | 'bmi'>('tdee')

  // TDEE state
  const [sex, setSex] = useState('H')
  const [age, setAge] = useState(30)
  const [height, setHeight] = useState(175)
  const [weight, setWeight] = useState(75)
  const [activity, setActivity] = useState(1.55)
  const [goalType, setGoalType] = useState('maintain')

  // Protein state
  const [protWeight, setProtWeight] = useState(75)
  const [protSex, setProtSex] = useState('H')

  // Macro split state
  const [macroKcal, setMacroKcal] = useState(2000)
  const [macroGluc, setMacroGluc] = useState(50)
  const [macroLip, setMacroLip] = useState(30)
  const [macroProt, setMacroProt] = useState(20)

  // BMI state
  const [bmiWeight, setBmiWeight] = useState(75)
  const [bmiHeight, setBmiHeight] = useState(175)

  // TDEE calc
  const { bmr, tdee } = computeTDEE(sex, age, height, weight, activity)
  let kcalGoal = tdee
  if (goalType === 'lose') kcalGoal = tdee - 500
  if (goalType === 'gain') kcalGoal = tdee + 300

  const proteinRec = {
    gluc: Math.round((kcalGoal * 0.50) / 4),
    lip: Math.round((kcalGoal * 0.30) / 9),
    prot: Math.round((kcalGoal * 0.20) / 4),
  }

  // Protein calc
  const { anses, issn_lo, issn_hi, morton } = computeProtein(protWeight, protSex)

  // Macro calc
  const glucPct = macroGluc
  const lipPct = macroLip
  const protPct = macroProt
  const total = glucPct + lipPct + protPct
  const macroG = {
    gluc: Math.round((macroKcal * glucPct / 100) / 4),
    lip: Math.round((macroKcal * lipPct / 100) / 9),
    prot: Math.round((macroKcal * protPct / 100) / 4),
  }

  // BMI calc
  const bmiVal = bmiHeight > 0 ? +(bmiWeight / ((bmiHeight / 100) ** 2)).toFixed(1) : 0
  const bmiCat =
    bmiVal < 16.5 ? { l: 'Dénutrition', c: 'var(--danger)' }
    : bmiVal < 18.5 ? { l: 'Insuffisance pondérale', c: 'var(--warn)' }
    : bmiVal < 25 ? { l: 'Poids normal', c: 'var(--ok)' }
    : bmiVal < 30 ? { l: 'Surpoids', c: 'var(--warn)' }
    : bmiVal < 35 ? { l: 'Obésité modérée', c: 'var(--danger)' }
    : bmiVal < 40 ? { l: 'Obésité sévère', c: 'var(--danger)' }
    : { l: 'Obésité morbide', c: 'var(--danger)' }

  const inputStyle = { width: '100%', padding: '9px 10px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 14, background: 'var(--surface)', color: 'var(--tx)', outline: 'none', fontFamily: 'inherit' }
  const labelStyle = { fontSize: 11, color: 'var(--tx2)', display: 'block' as const, marginBottom: 5, marginTop: 10 }
  const resultCardStyle = (c: string, bg: string) => ({
    background: bg, borderRadius: 'var(--r)', padding: '12px 14px', textAlign: 'center' as const,
  })

  const tabs = [
    { id: 'tdee', label: 'TDEE', icon: 'ti-bolt' },
    { id: 'protein', label: 'Protéines', icon: 'ti-dna' },
    { id: 'macros', label: 'Macros', icon: 'ti-chart-pie' },
    { id: 'bmi', label: 'IMC', icon: 'ti-scale' },
  ]

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 780 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Simulateurs</div>
      <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 20 }}>
        TDEE · Besoins protéiques · Répartition macros · IMC
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22, flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSimTab(tab.id as any)}
            style={{
              padding: '7px 14px', fontSize: 13, border: '0.5px solid var(--bd2)',
              borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              background: simTab === tab.id ? 'var(--tx)' : 'none',
              color: simTab === tab.id ? '#fff' : 'var(--tx2)',
              borderColor: simTab === tab.id ? 'var(--tx)' : 'var(--bd2)',
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ marginRight: 5 }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TDEE tab */}
      {simTab === 'tdee' && (
        <div>
          <div style={{ background: 'var(--bkcal)', borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 18, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-info-circle" style={{ color: 'var(--kcal)', marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx)', lineHeight: 1.6 }}>
              Formule <strong>Mifflin-St Jeor</strong> avec correction <strong>−8%</strong> (facteur 0,92) pour compenser les surestimations habituelles du TDEE.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="sim-form-grid">
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
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Niveau d'activité</label>
              <select value={activity} onChange={e => setActivity(+e.target.value)} style={inputStyle}>
                {ACTIVITY_LEVELS.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Objectif</label>
              <select value={goalType} onChange={e => setGoalType(e.target.value)} style={inputStyle}>
                {GOALS_LABELS.map(g => <option key={g.v} value={g.v}>{g.l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="sim-result-grid">
            <div style={resultCardStyle('var(--tx2)', 'var(--s2)')}>
              <div style={{ fontSize: 11, color: 'var(--tx2)', marginBottom: 3 }}>BMR (métabolisme basal)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--tx)' }}>{bmr}</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>kcal/jour</div>
            </div>
            <div style={resultCardStyle('var(--kcal)', 'var(--bkcal)')}>
              <div style={{ fontSize: 11, color: 'var(--kcal)', marginBottom: 3 }}>TDEE (dépense totale)</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--kcal)' }}>{tdee}</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>kcal/jour</div>
            </div>
            <div style={resultCardStyle('var(--gluc)', 'var(--bgluc)')}>
              <div style={{ fontSize: 11, color: 'var(--gluc)', marginBottom: 3 }}>
                {goalType === 'lose' ? 'Objectif perte' : goalType === 'gain' ? 'Objectif prise' : 'Objectif maintien'}
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--gluc)' }}>{kcalGoal}</div>
              <div style={{ fontSize: 11, color: 'var(--tx3)' }}>kcal/jour</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
              Répartition macros suggérée
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { l: 'Glucides (50%)', v: proteinRec.gluc, c: 'var(--gluc)', bg: 'var(--bgluc)' },
                { l: 'Lipides (30%)', v: proteinRec.lip, c: 'var(--lip)', bg: 'var(--blip)' },
                { l: 'Protéines (20%)', v: proteinRec.prot, c: 'var(--prot)', bg: 'var(--bprot)' },
              ].map(({ l, v, c, bg }) => (
                <div key={l} style={{ background: bg, borderRadius: 'var(--r)', padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}g</div>
                  <div style={{ fontSize: 10, color: 'var(--tx2)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Protein tab */}
      {simTab === 'protein' && (
        <div>
          <div style={{ background: 'var(--bprot)', borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 18, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-info-circle" style={{ color: 'var(--prot)', marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx)', lineHeight: 1.6 }}>
              Recommandations selon <strong>ANSES 2021</strong> (0,83g/kg), <strong>ISSN 2017</strong> (1,6–2,2g/kg pour les sportifs), et <strong>Morton 2018</strong> (plafond ≈2,2g/kg).
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="sim-form-grid">
            <div>
              <label style={labelStyle}>Sexe</label>
              <select value={protSex} onChange={e => setProtSex(e.target.value)} style={inputStyle}>
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Poids (kg)</label>
              <input type="number" value={protWeight} onChange={e => setProtWeight(+e.target.value)} min={20} max={300} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
            {[
              {
                label: 'ANSES 2021 — Minimum recommandé',
                sub: '0,83 g/kg/j · Population générale sédentaire',
                v: anses,
                c: 'var(--gluc)', bg: 'var(--bgluc)',
              },
              {
                label: 'ISSN 2017 — Sportif (bas de fourchette)',
                sub: '1,6 g/kg/j · Activité physique régulière',
                v: issn_lo,
                c: 'var(--kcal)', bg: 'var(--bkcal)',
              },
              {
                label: 'ISSN 2017 — Sportif (haut de fourchette)',
                sub: '2,2 g/kg/j · Entraînement intensif',
                v: issn_hi,
                c: 'var(--prot)', bg: 'var(--bprot)',
              },
              {
                label: 'Morton 2018 — Plafond maximal',
                sub: '≈ 2,2 g/kg/j · Au-delà, pas d\'effet supplémentaire',
                v: morton,
                c: 'var(--lip)', bg: 'var(--blip)',
              },
            ].map(({ label, sub, v, c, bg }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rx)', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{sub}</div>
                </div>
                <div style={{ background: bg, borderRadius: 'var(--r)', padding: '8px 14px', textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c, lineHeight: 1 }}>{v}g</div>
                  <div style={{ fontSize: 10, color: 'var(--tx3)' }}>/ jour</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--s2)', borderRadius: 'var(--r)', padding: '10px 13px', marginTop: 14, fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 }}>
            <i className="ti ti-info-circle" style={{ marginRight: 6 }} />
            Ces valeurs correspondent au poids corporel total. Pour les personnes en surpoids, on peut utiliser le poids de forme cible.
          </div>
        </div>
      )}

      {/* Macros tab */}
      {simTab === 'macros' && (
        <div>
          <div style={{ background: 'var(--bgluc)', borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 18, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-info-circle" style={{ color: 'var(--gluc)', marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx)', lineHeight: 1.6 }}>
              Calculer les grammes de chaque macro pour un total calorique et des pourcentages donnés.
            </div>
          </div>

          <div>
            <label style={labelStyle}>Apport calorique total (kcal/j)</label>
            <input type="number" value={macroKcal} onChange={e => setMacroKcal(+e.target.value)} min={500} max={6000} step={50} style={inputStyle} />
          </div>

          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="sim-form-grid">
            {[
              { l: '% Glucides', v: macroGluc, set: setMacroGluc, c: 'var(--gluc)' },
              { l: '% Lipides', v: macroLip, set: setMacroLip, c: 'var(--lip)' },
              { l: '% Protéines', v: macroProt, set: setMacroProt, c: 'var(--prot)' },
            ].map(({ l, v, set, c }) => (
              <div key={l}>
                <label style={{ ...labelStyle, color: c }}>{l}</label>
                <input
                  type="number" value={v}
                  onChange={e => set(+e.target.value)}
                  min={0} max={100}
                  style={{ ...inputStyle, color: c }}
                />
              </div>
            ))}
          </div>
          {Math.abs(total - 100) > 0.1 && (
            <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>
              Total : {total}% (doit être 100%)
            </div>
          )}

          <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { l: 'Glucides', v: macroG.gluc, c: 'var(--gluc)', bg: 'var(--bgluc)', sub: '4 kcal/g' },
              { l: 'Lipides', v: macroG.lip, c: 'var(--lip)', bg: 'var(--blip)', sub: '9 kcal/g' },
              { l: 'Protéines', v: macroG.prot, c: 'var(--prot)', bg: 'var(--bprot)', sub: '4 kcal/g' },
            ].map(({ l, v, c, bg, sub }) => (
              <div key={l} style={{ background: bg, borderRadius: 'var(--rx)', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: c, lineHeight: 1 }}>{v}g</div>
                <div style={{ fontSize: 12, color: 'var(--tx)', marginTop: 3 }}>{l}</div>
                <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 1 }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* ANSES ranges check */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--tx3)', marginBottom: 8 }}>
              Vérification ANSES (fourchettes recommandées)
            </div>
            {[
              { l: 'Glucides', v: macroGluc, min: 40, max: 55, c: 'var(--gluc)', bg: 'var(--bgluc)' },
              { l: 'Lipides', v: macroLip, min: 30, max: 40, c: 'var(--lip)', bg: 'var(--blip)' },
              { l: 'Protéines', v: macroProt, min: 15, max: 25, c: 'var(--prot)', bg: 'var(--bprot)' },
            ].map(({ l, v, min, max, c, bg }) => {
              const ok = v >= min && v <= max
              return (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '0.5px solid var(--bd)' }}>
                  <div style={{ width: 80, fontSize: 12, color: 'var(--tx2)' }}>{l}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 7, flex: 1, background: 'var(--s2)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: `${min}%`, width: `${max - min}%`, height: '100%', background: bg, opacity: .5 }} />
                        <div style={{ position: 'absolute', left: `${Math.min(v, 100)}%`, width: 2, height: '100%', background: c, transform: 'translateX(-1px)' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: ok ? 'var(--ok)' : 'var(--warn)', minWidth: 42, textAlign: 'right' }}>
                        {ok ? '✓' : '⚠'} {v}%
                      </div>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 2 }}>Recommandé : {min}–{max}%</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BMI tab */}
      {simTab === 'bmi' && (
        <div>
          <div style={{ background: 'var(--s2)', borderRadius: 'var(--r)', padding: '10px 13px', marginBottom: 18, display: 'flex', gap: 7, alignItems: 'flex-start' }}>
            <i className="ti ti-info-circle" style={{ color: 'var(--tx3)', marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: 'var(--tx2)', lineHeight: 1.6 }}>
              L'IMC (Indice de Masse Corporelle) est un indicateur indicatif. Il ne tient pas compte de la composition corporelle (muscle vs graisse).
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }} className="sim-form-grid">
            <div>
              <label style={labelStyle}>Poids (kg)</label>
              <input type="number" value={bmiWeight} onChange={e => setBmiWeight(+e.target.value)} min={20} max={300} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Taille (cm)</label>
              <input type="number" value={bmiHeight} onChange={e => setBmiHeight(+e.target.value)} min={100} max={250} style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center', background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rx)', padding: '24px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--tx3)', marginBottom: 8 }}>Votre IMC</div>
            <div style={{ fontSize: 52, fontWeight: 800, color: bmiCat.c, lineHeight: 1 }}>{bmiVal}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: bmiCat.c, marginTop: 6 }}>{bmiCat.l}</div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column' as const, gap: 0 }}>
            {[
              { l: 'Dénutrition', min: '< 16,5', ok: bmiVal < 16.5, c: 'var(--danger)' },
              { l: 'Insuffisance pondérale', min: '16,5–18,5', ok: bmiVal >= 16.5 && bmiVal < 18.5, c: 'var(--warn)' },
              { l: 'Poids normal', min: '18,5–25', ok: bmiVal >= 18.5 && bmiVal < 25, c: 'var(--ok)' },
              { l: 'Surpoids', min: '25–30', ok: bmiVal >= 25 && bmiVal < 30, c: 'var(--warn)' },
              { l: 'Obésité modérée', min: '30–35', ok: bmiVal >= 30 && bmiVal < 35, c: 'var(--danger)' },
              { l: 'Obésité sévère', min: '35–40', ok: bmiVal >= 35 && bmiVal < 40, c: 'var(--danger)' },
              { l: 'Obésité morbide', min: '≥ 40', ok: bmiVal >= 40, c: 'var(--danger)' },
            ].map(({ l, min, ok, c }) => (
              <div key={l} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderBottom: '0.5px solid var(--bd)',
                background: ok ? 'var(--s2)' : 'transparent',
                borderRadius: ok ? 'var(--r)' : 0,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 13, color: ok ? 'var(--tx)' : 'var(--tx2)', fontWeight: ok ? 700 : 400 }}>{l}</div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', fontVariantNumeric: 'tabular-nums' }}>{min}</div>
                {ok && <i className="ti ti-arrow-left" style={{ color: c, fontSize: 13 }} />}
              </div>
            ))}
          </div>

          {/* Healthy weight range */}
          {bmiHeight > 0 && (
            <div style={{ marginTop: 14, background: 'var(--bgluc)', borderRadius: 'var(--r)', padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--gluc)' }}>Poids santé pour votre taille</div>
              <div style={{ fontSize: 13, color: 'var(--tx)' }}>
                {Math.round(18.5 * (bmiHeight / 100) ** 2)} – {Math.round(25 * (bmiHeight / 100) ** 2)} kg
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .sim-form-grid { grid-template-columns: 1fr !important; }
          .sim-result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
