import React, { useState } from 'react'
import { FOODS, FOOD_CATEGORIES } from '../data/foods'
import { useSupplementStore } from '../store/useSupplementStore'
import { useAI } from '../hooks/useAI'
import { usePreferencesStore } from '../store/usePreferencesStore'
import type { Food } from '../types'

const ALL_FOOD_CATS = [
  'Viandes rouges','Volailles','Poissons','Fruits de mer','Œufs & Laitiers',
  'Légumes','Féculents','Légumineuses','Fruits','Oléagineux',
  'Matières grasses','Boissons','Condiments','Sucreries','Plats cuisinés','Autre',
]

export default function FoodsPage() {
  const { customFoods, addCustomFood, deleteCustomFood } = useSupplementStore()
  const { lookupFood } = useAI()
  const { apiKey, setApiKey } = usePreferencesStore()

  const [dbSearch, setDbSearch] = useState('')
  const [dbCat, setDbCat] = useState('')
  const [aiFoodName, setAiFoodName] = useState('')
  const [aiFoodCat, setAiFoodCat] = useState('Légumes')
  const [aiResult, setAiResult] = useState<(Food & { note?: string }) | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || localStorage.getItem('nj4ak') || '')
  const [apiKeySaved, setApiKeySaved] = useState(!!(apiKey || localStorage.getItem('nj4ak')))

  const allFoods = [
    ...FOODS,
    ...customFoods.filter(f => !FOODS.find(x => x.n === f.n && x.c === f.c)).map(f => ({ ...f, _custom: true as const }))
  ]

  const coll = new Intl.Collator('fr', { sensitivity: 'base' })
  const filtered = allFoods
    .filter(f => (!dbCat || f.c === dbCat) && (!dbSearch || f.n.toLowerCase().includes(dbSearch.toLowerCase()) || f.c.toLowerCase().includes(dbSearch.toLowerCase())))
    .sort((a, b) => coll.compare(a.c, b.c) || coll.compare(a.n, b.n))

  async function handleAiLookup() {
    if (!aiFoodName.trim()) { setAiError('Veuillez entrer un nom.'); return }
    const key = apiKeyInput.trim() || localStorage.getItem('nj4ak') || ''
    if (!key) { setAiError("Clé API manquante. Entrez votre clé Anthropic ci-dessous."); return }
    setAiError(''); setAiResult(null); setAiLoading(true)
    try {
      const result = await lookupFood(aiFoodName.trim(), aiFoodCat)
      setAiResult(result)
    } catch (e: any) {
      setAiError('Erreur : ' + e.message)
    } finally {
      setAiLoading(false)
    }
  }

  function handleConfirmAi() {
    if (!aiResult) return
    addCustomFood(aiResult)
    setAiFoodName('')
    setAiResult(null)
  }

  function handleSaveApiKey() {
    const k = apiKeyInput.trim()
    if (k) {
      setApiKey(k)
      localStorage.setItem('nj4ak', k)
      setApiKeySaved(true)
    }
  }

  let lastCat = ''

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Base d'aliments</div>
      <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 20 }}>
        {FOODS.length} aliments (FDA/USDA) · Ajout IA avec valeurs nutritionnelles automatiques
      </div>

      {/* AI lookup card */}
      <div className="card" style={{ border: '1.5px solid var(--gluc)', marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7, color: 'var(--gluc)' }}>
          <i className="ti ti-sparkles" />
          Ajouter un aliment (IA)
        </div>
        <p style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 10, lineHeight: 1.6 }}>
          Tapez un nom d'aliment, l'IA recherche automatiquement ses valeurs nutritionnelles pour 100g.
        </p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: 17, pointerEvents: 'none' }} />
            <input
              type="text"
              value={aiFoodName}
              onChange={e => setAiFoodName(e.target.value)}
              placeholder="Ex: Quinoa soufflé, Kéfir, Tempeh…"
              onKeyDown={e => e.key === 'Enter' && handleAiLookup()}
              style={{ width: '100%', padding: '10px 14px 10px 38px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--rl)', background: 'var(--surface)', fontSize: 13, color: 'var(--tx)', outline: 'none' }}
            />
          </div>
          <select value={aiFoodCat} onChange={e => setAiFoodCat(e.target.value)}>
            {ALL_FOOD_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={handleAiLookup} disabled={aiLoading} className="btn btn-g">
            <i className="ti ti-sparkles" />
            {aiLoading ? 'Recherche…' : 'Rechercher'}
          </button>
        </div>

        {aiLoading && (
          <div style={{ fontSize: 13, color: 'var(--tx2)', padding: '8px 0' }}>
            <i className="ti ti-loader" style={{ marginRight: 6 }} />
            Recherche en cours…
          </div>
        )}
        {aiError && (
          <div style={{ fontSize: 12, color: 'var(--danger)', padding: '5px 0' }}>{aiError}</div>
        )}

        {aiResult && (
          <div style={{ background: 'var(--bgluc)', borderRadius: 'var(--rl)', padding: 13, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', marginBottom: 9 }}>
              <i className="ti ti-sparkles" style={{ color: 'var(--gluc)', marginRight: 6 }} />
              <strong>{aiResult.n}</strong> <span style={{ color: 'var(--tx3)', fontWeight: 400 }}>- pour 100g</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
              {[
                { v: aiResult.k, l: 'kcal', c: 'var(--kcal)' },
                { v: `${aiResult.g}g`, l: 'glucides', c: 'var(--gluc)' },
                { v: `${aiResult.l}g`, l: 'lipides', c: 'var(--lip)' },
                { v: `${aiResult.p}g`, l: 'protéines', c: 'var(--prot)' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{ background: 'var(--surface)', borderRadius: 'var(--r)', padding: '9px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 10, color: 'var(--tx2)', marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleConfirmAi} className="btn btn-g"><i className="ti ti-check" />Confirmer</button>
              <button onClick={() => setAiResult(null)} className="btn"><i className="ti ti-x" />Annuler</button>
            </div>
          </div>
        )}

        {/* API Key section */}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--bd)' }}>
          <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 6 }}>
            Clé API Anthropic (stockée localement, jamais transmise)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-…"
              style={{ flex: 1, minWidth: 160, padding: '8px 10px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, background: 'var(--surface)', color: 'var(--tx)' }}
            />
            <button onClick={handleSaveApiKey} className="btn btn-g">
              <i className="ti ti-key" />Enregistrer
            </button>
          </div>
          {apiKeySaved && <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 5 }}>✓ Clé enregistrée</div>}
        </div>
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
          <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: 17, pointerEvents: 'none' }} />
          <input
            type="text"
            value={dbSearch}
            onChange={e => setDbSearch(e.target.value)}
            placeholder="Filtrer les aliments…"
            style={{ width: '100%', padding: '10px 14px 10px 38px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--rl)', background: 'var(--surface)', fontSize: 13, color: 'var(--tx)', outline: 'none' }}
          />
        </div>
        <select value={dbCat} onChange={e => setDbCat(e.target.value)}>
          <option value="">Toutes catégories</option>
          {FOOD_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--tx2)', background: 'var(--s2)', padding: '6px 11px', borderRadius: 'var(--r)' }}>
          <i className="ti ti-list-numbers" />
          {filtered.length} aliment{filtered.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Food table */}
      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--rl)', overflow: 'hidden' }}>
        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--tx2)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--s2)', textAlign: 'left', minWidth: 140 }}>Aliment</th>
                <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--tx2)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--s2)', textAlign: 'left', width: 120 }}>Catégorie</th>
                <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--kcal)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--s2)', textAlign: 'right', width: 68 }}>Kcal</th>
                <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--gluc)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--s2)', textAlign: 'right', width: 68 }}>Gluc</th>
                <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--lip)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--s2)', textAlign: 'right', width: 68 }}>Lip</th>
                <th style={{ padding: '9px 12px', fontSize: 10, fontWeight: 700, color: 'var(--prot)', textTransform: 'uppercase', letterSpacing: '.06em', background: 'var(--s2)', textAlign: 'right', width: 68 }}>Prot</th>
                <th style={{ padding: '9px 12px', background: 'var(--s2)', width: 36 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center', color: 'var(--tx3)', fontSize: 13 }}>
                    Aucun aliment trouvé.
                  </td>
                </tr>
              ) : filtered.map((f, idx) => {
                const isCustom = !!f._custom
                let header = null
                if (f.c !== lastCat) {
                  lastCat = f.c
                  header = (
                    <tr key={`cat-${f.c}`}>
                      <td colSpan={7} style={{ padding: '7px 12px 4px', fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', background: 'var(--bg)' }}>
                        {f.c}
                      </td>
                    </tr>
                  )
                }
                return (
                  <React.Fragment key={`${f.n}-${idx}`}>
                    {header}
                    <tr style={{ borderBottom: '0.5px solid var(--bd)', background: isCustom ? 'linear-gradient(90deg,rgba(245,166,35,.06),transparent 30%)' : undefined }}>
                      <td style={{ padding: '7px 12px', fontSize: 13, fontWeight: 500, lineHeight: 1.4, color: 'var(--tx)' }}>
                        {isCustom && <i className="ti ti-sparkles" style={{ fontSize: 10, color: 'var(--warn)', marginRight: 5 }} />}
                        {f.n}
                      </td>
                      <td style={{ padding: '7px 12px', fontSize: 11, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>{f.c}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--kcal)', whiteSpace: 'nowrap' }}>{f.k}</td>
                      <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--gluc)', whiteSpace: 'nowrap' }}>{f.g}g</td>
                      <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--lip)', whiteSpace: 'nowrap' }}>{f.l}g</td>
                      <td style={{ padding: '7px 12px', textAlign: 'right', fontSize: 12, color: 'var(--prot)', whiteSpace: 'nowrap' }}>{f.p}g</td>
                      <td style={{ padding: '7px 12px', textAlign: 'center' }}>
                        {isCustom && (
                          <button
                            onClick={() => deleteCustomFood(f.n)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', fontSize: 14, padding: 4, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
                          >
                            <i className="ti ti-trash" />
                          </button>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 7, textAlign: 'right' }}>
        Valeurs pour 100g · Sources : FDA / USDA FoodData Central
      </div>
    </div>
  )
}
