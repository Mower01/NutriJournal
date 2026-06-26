import React, { useState, useRef } from 'react'
import { useNutritionStore } from '../store/useNutritionStore'
import { useSupplementStore } from '../store/useSupplementStore'
import { useTotals } from '../hooks/useTotals'
import { FOODS, FOOD_CATEGORIES } from '../data/foods'
import { SUPPS_DB, isSuppOn, getSuppDoseInfo, calcSuppProt } from '../data/supplements'
import MacroGrid from '../components/MacroGrid'
import type { Food, Meal } from '../types'

const MEAL_CATS = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function JournalPage() {
  const { currentDate, setDate, data, goals, addMeal, removeMeal, toggleSupp, setSuppDose } = useNutritionStore()
  const { customSupps, customFoods } = useSupplementStore()
  const totals = useTotals()

  const [journalTab, setJournalTab] = useState<'food' | 'supps' | 'resume'>('food')
  const [searchQ, setSearchQ] = useState('')
  const [activeCat, setActiveCat] = useState('Tous')
  const [selectedFood, setSelectedFood] = useState<Food | null>(null)
  const [qty, setQty] = useState(100)
  const [mealCat, setMealCat] = useState('Déjeuner')
  const [showManual, setShowManual] = useState(false)
  const [manual, setManual] = useState({ n: '', k: '', g: '', l: '', p: '' })
  const [manualCat, setManualCat] = useState('Déjeuner')

  const day = data[currentDate] || { meals: [], supps: {} }
  const allFoods = [...FOODS, ...customFoods.filter(f => !FOODS.find(x => x.n === f.n))]
  const allSupps = [...SUPPS_DB, ...customSupps]

  function changeDay(d: number) {
    const date = new Date(currentDate + 'T12:00:00')
    date.setDate(date.getDate() + d)
    setDate(date.toISOString().split('T')[0])
  }

  const filtered = searchQ || activeCat !== 'Tous'
    ? allFoods.filter(f =>
        (activeCat === 'Tous' || f.c === activeCat) &&
        (!searchQ || f.n.toLowerCase().includes(searchQ.toLowerCase()) || f.c.toLowerCase().includes(searchQ.toLowerCase()))
      ).slice(0, 30)
    : []

  function handleSelectFood(food: Food) {
    setSelectedFood(food)
    setSearchQ(food.n)
    setQty(100)
  }

  function handleAddFood() {
    if (!selectedFood) return
    const f = qty / 100
    const meal: Meal = {
      id: Date.now().toString(),
      n: selectedFood.n,
      k: selectedFood.k * f,
      g: selectedFood.g * f,
      l: selectedFood.l * f,
      p: selectedFood.p * f,
      qty,
      unit: 'g',
      cat: mealCat,
    }
    addMeal(currentDate, meal)
    setSearchQ('')
    setSelectedFood(null)
    setQty(100)
  }

  function handleAddManual() {
    if (!manual.n.trim()) return
    const meal: Meal = {
      id: Date.now().toString(),
      n: manual.n,
      k: parseFloat(manual.k) || 0,
      g: parseFloat(manual.g) || 0,
      l: parseFloat(manual.l) || 0,
      p: parseFloat(manual.p) || 0,
      qty: 100,
      unit: 'g',
      cat: manualCat,
    }
    addMeal(currentDate, meal)
    setManual({ n: '', k: '', g: '', l: '', p: '' })
    setShowManual(false)
  }

  const takenIds = Object.entries(day.supps || {}).filter(([, v]) => isSuppOn(v as any)).map(([id]) => id)
  const takenProt = Math.round(takenIds.reduce((a, id) => {
    const info = getSuppDoseInfo(id)
    if (!info.protPct) return a
    const val = day.supps[id]
    const dose = typeof val === 'object' && (val as any).dose ? (val as any).dose : info.dd
    return a + calcSuppProt(id, dose)
  }, 0) * 10) / 10

  const suppsByCategory: Record<string, typeof allSupps> = {}
  allSupps.forEach(s => {
    if (!suppsByCategory[s.cat]) suppsByCategory[s.cat] = []
    suppsByCategory[s.cat].push(s)
  })

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      {/* Date bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Journal du jour</div>
          <div style={{ fontSize: 13, color: 'var(--tx2)' }}>Enregistrez vos repas</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => changeDay(-1)} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', padding: '7px 11px', cursor: 'pointer', color: 'var(--tx2)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-chevron-left" />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, minWidth: 160, textAlign: 'center', color: 'var(--tx)' }}>
            {formatDate(currentDate)}
          </span>
          <button onClick={() => changeDay(1)} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', padding: '7px 11px', cursor: 'pointer', color: 'var(--tx2)', minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ti ti-chevron-right" />
          </button>
        </div>
      </div>

      <MacroGrid totals={totals} goals={goals} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[
          { id: 'food', label: 'Alimentation', icon: 'ti-fork-knife' },
          { id: 'supps', label: 'Suppléments', icon: 'ti-pill' },
          { id: 'resume', label: 'Résumé', icon: 'ti-list' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setJournalTab(tab.id as any)}
            style={{
              padding: '7px 16px', fontSize: 13, border: '0.5px solid var(--bd2)', borderRadius: 20,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              display: 'flex', alignItems: 'center', gap: 5,
              background: journalTab === tab.id ? 'var(--tx)' : 'none',
              color: journalTab === tab.id ? '#fff' : 'var(--tx2)',
              borderColor: journalTab === tab.id ? 'var(--tx)' : 'var(--bd2)',
            }}
          >
            <i className={`ti ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Food tab */}
      {journalTab === 'food' && (
        <div>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-plus-circle" style={{ fontSize: 16, color: 'var(--gluc)' }} />
              Ajouter un aliment
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: 17, pointerEvents: 'none' }} />
                <input
                  type="text"
                  value={searchQ}
                  onChange={e => { setSearchQ(e.target.value); setSelectedFood(null) }}
                  placeholder="Rechercher un aliment…"
                  autoComplete="off"
                  style={{ width: '100%', padding: '10px 14px 10px 38px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--rl)', background: 'var(--surface)', fontSize: 13, color: 'var(--tx)', outline: 'none' }}
                />
              </div>
              <select value={mealCat} onChange={e => setMealCat(e.target.value)}>
                {MEAL_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Category pills */}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {['Tous', ...FOOD_CATEGORIES].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCat(cat)}
                  style={{
                    padding: '4px 10px', fontSize: 11, border: '0.5px solid var(--bd2)',
                    borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
                    background: activeCat === cat ? 'var(--gluc)' : 'none',
                    color: activeCat === cat ? '#fff' : 'var(--tx2)',
                    borderColor: activeCat === cat ? 'var(--gluc)' : 'var(--bd2)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dropdown */}
            {filtered.length > 0 && !selectedFood && (
              <div style={{ border: '0.5px solid var(--bd)', borderRadius: 'var(--rl)', maxHeight: 220, overflowY: 'auto', background: 'var(--surface)', marginBottom: 8 }}>
                {filtered.map(f => (
                  <div
                    key={f.n}
                    onClick={() => handleSelectFood(f)}
                    style={{ padding: '9px 14px', borderBottom: '0.5px solid var(--bd)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{f.n}</div>
                      <div style={{ fontSize: 10, color: 'var(--tx3)' }}>{f.c}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {[{ v: f.k, l: 'kcal' }, { v: `${f.g}g`, l: 'gluc' }, { v: `${f.l}g`, l: 'lip' }, { v: `${f.p}g`, l: 'prot' }].map(({ v, l }) => (
                        <div key={l} style={{ fontSize: 10, textAlign: 'center', color: 'var(--tx2)' }}>
                          <b style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--tx)' }}>{v}</b>
                          {l}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filtered.length === 0 && searchQ && !selectedFood && (
              <div style={{ padding: 14, textAlign: 'center', fontSize: 13, color: 'var(--tx2)' }}>
                Aucun résultat. Saisissez manuellement.
              </div>
            )}

            {/* Quantity strip */}
            {selectedFood && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', background: 'var(--bgluc)', borderRadius: 'var(--rl)', marginBottom: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, fontSize: 12, fontWeight: 600, minWidth: 80, color: 'var(--tx)' }}>
                  {selectedFood.n} — pour 100g
                </div>
                <label style={{ fontSize: 11, color: 'var(--tx2)' }}>Qté</label>
                <input
                  type="number"
                  value={qty}
                  onChange={e => setQty(parseFloat(e.target.value) || 100)}
                  min={1}
                  style={{ width: 70, padding: '7px 9px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 14, background: 'var(--surface)', color: 'var(--tx)' }}
                />
                <span style={{ fontSize: 11, color: 'var(--tx2)' }}>g</span>
                <button onClick={handleAddFood} className="btn btn-g">
                  <i className="ti ti-plus" />Ajouter
                </button>
              </div>
            )}

            {/* Manual entry */}
            <span
              onClick={() => setShowManual(v => !v)}
              style={{ fontSize: 11, color: 'var(--tx3)', cursor: 'pointer', textDecoration: 'underline', marginBottom: 8, display: 'inline-block' }}
            >
              + Saisir manuellement
            </span>
            {showManual && (
              <div style={{ background: 'var(--s2)', borderRadius: 'var(--rl)', padding: 13, marginBottom: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 7, marginBottom: 8 }}>
                  {[
                    { id: 'n', label: 'Aliment', placeholder: 'Nom', type: 'text' },
                    { id: 'k', label: 'Kcal', placeholder: '0', type: 'number' },
                    { id: 'g', label: 'Glucides g', placeholder: '0', type: 'number' },
                    { id: 'l', label: 'Lipides g', placeholder: '0', type: 'number' },
                    { id: 'p', label: 'Protéines g', placeholder: '0', type: 'number' },
                  ].map(({ id, label, placeholder, type }) => (
                    <div key={id}>
                      <label style={{ fontSize: 10, color: 'var(--tx2)', display: 'block', marginBottom: 3 }}>{label}</label>
                      <input
                        type={type}
                        value={(manual as any)[id]}
                        onChange={e => setManual(m => ({ ...m, [id]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: '100%', padding: '8px 9px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, background: 'var(--surface)', color: 'var(--tx)' }}
                      />
                    </div>
                  ))}
                </div>
                <select value={manualCat} onChange={e => setManualCat(e.target.value)} style={{ marginBottom: 8 }}>
                  {MEAL_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <br />
                <button onClick={handleAddManual} className="btn btn-g">
                  <i className="ti ti-plus" />Ajouter
                </button>
              </div>
            )}
          </div>

          {/* Meal list */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '0 0 10px' }}>
            Repas enregistrés
          </div>
          {day.meals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--tx3)', fontSize: 13 }}>
              <i className="ti ti-bowl" style={{ fontSize: 28, display: 'block', marginBottom: 7 }} />
              Aucun aliment pour ce jour
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {day.meals.map((m, i) => (
                <div key={m.id || i} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, minWidth: 80, color: 'var(--tx)' }}>{m.n}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--s2)', color: 'var(--tx2)' }}>{m.cat}</span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[
                      { l: `${Math.round(m.k)} kcal` },
                      { l: `G:${Math.round(m.g)}g` },
                      { l: `L:${Math.round(m.l)}g` },
                      { l: `P:${Math.round(m.p)}g` },
                    ].map(({ l }) => (
                      <div key={l} style={{ fontSize: 11, color: 'var(--tx2)' }}>{l}</div>
                    ))}
                    {m.qty && m.qty !== 100 && <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{m.qty}g</div>}
                  </div>
                  <button
                    onClick={() => removeMeal(currentDate, i)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', fontSize: 15, padding: 4, minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                  >
                    <i className="ti ti-x" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supps tab */}
      {journalTab === 'supps' && (
        <div>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-pill" style={{ fontSize: 16, color: 'var(--prot)' }} />
              Suppléments du jour
            </div>
            {takenIds.length > 0 && (
              <div style={{ background: 'var(--bprot)', color: 'var(--prot)', padding: '9px 13px', borderRadius: 'var(--r)', fontSize: 12, fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 7 }}>
                <i className="ti ti-check-circle" />
                {takenIds.length} supplément{takenIds.length > 1 ? 's' : ''} pris aujourd'hui
                {takenProt > 0 && <span style={{ fontWeight: 700 }}> · +{takenProt}g protéines</span>}
              </div>
            )}
            {Object.entries(suppsByCategory).map(([cat, supps]) => (
              <div key={cat}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', margin: '12px 0 5px', paddingBottom: 4, borderBottom: '0.5px solid var(--bd2)' }}>
                  {cat}
                </div>
                {supps.map(s => {
                  const val = day.supps[s.id]
                  const on = isSuppOn(val as any)
                  const info = getSuppDoseInfo(s.id)
                  const storedDose = typeof val === 'object' && (val as any).dose ? (val as any).dose : null
                  const dispDose = storedDose ?? info.dd
                  const prot = on && info.protPct ? calcSuppProt(s.id, dispDose) : 0

                  return (
                    <div
                      key={s.id}
                      onClick={() => toggleSupp(currentDate, s.id, !on)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 2px', borderBottom: '0.5px solid var(--bd)', cursor: 'pointer', borderRadius: 4 }}
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={e => { e.stopPropagation(); toggleSupp(currentDate, s.id, e.target.checked) }}
                        style={{ width: 16, height: 16, flexShrink: 0, accentColor: 'var(--prot)', cursor: 'pointer' }}
                        onClick={e => e.stopPropagation()}
                      />
                      <span style={{ flex: 1, fontSize: 13, cursor: 'pointer', lineHeight: 1.3, fontWeight: on ? 600 : 400, color: on ? 'var(--prot)' : 'var(--tx)' }}>
                        {s.n}
                      </span>
                      {on ? (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--s2)', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}
                        >
                          <input
                            type="number"
                            value={dispDose}
                            min={0.1}
                            step={info.du === 'g' ? 0.5 : 1}
                            onChange={e => setSuppDose(currentDate, s.id, +e.target.value)}
                            style={{ width: 48, background: 'none', border: 'none', color: 'var(--tx)', fontSize: 12, fontWeight: 600, textAlign: 'right', fontFamily: 'inherit', outline: 'none' }}
                          />
                          <span style={{ fontSize: 10, color: 'var(--tx3)', fontWeight: 500, minWidth: 14 }}>{info.du}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: 10, color: 'var(--tx3)', whiteSpace: 'nowrap', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {info.dd} {info.du}
                        </span>
                      )}
                      {prot > 0 && (
                        <span style={{ fontSize: 10, color: 'var(--prot)', fontWeight: 600, background: 'var(--bprot)', padding: '2px 7px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                          +{prot}g prot.
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resume tab */}
      {journalTab === 'resume' && (
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Résumé du jour</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { l: 'Calories', v: Math.round(totals.k), u: 'kcal', c: 'var(--kcal)' },
              { l: 'Glucides', v: Math.round(totals.g), u: 'g', c: 'var(--gluc)' },
              { l: 'Lipides', v: Math.round(totals.l), u: 'g', c: 'var(--lip)' },
              { l: 'Protéines', v: Math.round(totals.p), u: 'g', c: 'var(--prot)' },
            ].map(({ l, v, u, c }) => (
              <div key={l} style={{ background: 'var(--s2)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--tx2)', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}{u}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--tx)' }}>
            {day.meals.length} aliment{day.meals.length > 1 ? 's' : ''} enregistré{day.meals.length > 1 ? 's' : ''}
          </div>
          {day.meals.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--bd)', fontSize: 12 }}>
              <span style={{ color: 'var(--tx)' }}>{m.n} {m.qty && m.qty !== 100 ? `(${m.qty}g)` : ''}</span>
              <span style={{ color: 'var(--tx2)' }}>{Math.round(m.k)} kcal</span>
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: 'var(--prot)' }}>
            {takenIds.length} supplément{takenIds.length > 1 ? 's' : ''} pris
            {takenProt > 0 && ` · +${takenProt}g protéines`}
          </div>
        </div>
      )}
    </div>
  )
}
