import React, { useState } from 'react'
import { useNutritionStore } from '../store/useNutritionStore'
import { useSupplementStore } from '../store/useSupplementStore'
import { useAI } from '../hooks/useAI'
import { usePreferencesStore } from '../store/usePreferencesStore'
import { SUPPS_DB, isSuppOn } from '../data/supplements'
import type { Supplement } from '../types'

const SUPP_CATS = ['Vitamines','Minéraux','Acides aminés','Plantes & Adaptogènes','Acides gras','Probiotiques & Prébiotiques','Enzymes & Cofacteurs','Antioxydants','Nootropiques','Sport & Performance','Autre']

interface SuppDetailOverlayProps {
  supp: Supplement
  onClose: () => void
  onToggle: () => void
  isOn: boolean
}

function SuppDetailOverlay({ supp, onClose, onToggle, isOn }: SuppDetailOverlayProps) {
  return (
    <div
      style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200, alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--rx)', padding: '22px 24px', maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'var(--s2)', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--tx3)', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="ti ti-x" />
        </button>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 3, paddingRight: 40, color: 'var(--tx)' }}>{supp.n}</div>
        <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>{supp.cat}</div>
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--tx2)', marginBottom: 5 }}>Description</h4>
          <p style={{ fontSize: 13, color: 'var(--tx)', lineHeight: 1.65 }}>{supp.desc}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginBottom: 12 }}>
          <div style={{ borderRadius: 'var(--r)', padding: '10px 12px', background: 'var(--bgluc)' }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--gluc)', marginBottom: 5 }}>✓ Avantages</h4>
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              {supp.pros?.map((p, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--tx)', marginBottom: 2 }}>• {p}</li>)}
            </ul>
          </div>
          <div style={{ borderRadius: 'var(--r)', padding: '10px 12px', background: 'var(--bprot)' }}>
            <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--prot)', marginBottom: 5 }}>⚠ Précautions</h4>
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              {supp.cons?.map((c, i) => <li key={i} style={{ fontSize: 12, lineHeight: 1.6, color: 'var(--tx)', marginBottom: 2 }}>• {c}</li>)}
            </ul>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <h4 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--tx2)', marginBottom: 5 }}>Dosage usuel</h4>
          <p style={{ fontSize: 13, color: 'var(--tx)' }}>{supp.dose || 'Voir recommandations spécifiques'}</p>
        </div>
        {supp.source && (
          <div style={{ fontSize: 10, color: 'var(--tx3)', marginTop: 10, borderTop: '0.5px solid var(--bd)', paddingTop: 7 }}>
            Sources : {supp.source}
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={onToggle}
            className="btn btn-g"
            style={{ background: isOn ? 'var(--tx2)' : 'var(--gluc)', borderColor: isOn ? 'var(--tx2)' : 'var(--gluc)' }}
          >
            <i className="ti ti-checkbox" />
            {isOn ? 'Déjà coché' : "Cocher aujourd'hui"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SupplementsPage() {
  const { currentDate, data, toggleSupp } = useNutritionStore()
  const { customSupps, addCustomSupp, deleteCustomSupp } = useSupplementStore()
  const { lookupSupplement } = useAI()
  const { apiKey, setApiKey } = usePreferencesStore()

  const [suppTab, setSuppTab] = useState<'suivi' | 'base' | 'custom'>('suivi')
  const [suiviSearch, setSuiviSearch] = useState('')
  const [suiviCat, setSuiviCat] = useState('')
  const [baseSearch, setBaseSearch] = useState('')
  const [baseCat, setBaseCat] = useState('')
  const [detailSupp, setDetailSupp] = useState<Supplement | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  // Custom form
  const [csName, setCsName] = useState('')
  const [csCat, setCsCat] = useState('Vitamines')
  const [csPros, setCsPros] = useState('')
  const [csCons, setCsCons] = useState('')
  const [csSource, setCsSource] = useState('')
  const [csFeedback, setCsFeedback] = useState('')

  // AI lookup
  const [aiSuppName, setAiSuppName] = useState('')
  const [aiSuppResult, setAiSuppResult] = useState<Supplement | null>(null)
  const [aiSuppLoading, setAiSuppLoading] = useState(false)
  const [aiSuppError, setAiSuppError] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState(apiKey || localStorage.getItem('nj4ak') || '')
  const [apiKeySaved, setApiKeySaved] = useState(!!(apiKey || localStorage.getItem('nj4ak')))

  const day = data[currentDate] || { meals: [], supps: {} }
  const allSupps = [...SUPPS_DB, ...customSupps]
  const coll = new Intl.Collator('fr', { sensitivity: 'base' })

  const allCats = [...new Set(allSupps.map(s => s.cat))].sort()

  // Suivi filtered
  const suiviFiltered = allSupps
    .filter(s => (!suiviCat || s.cat === suiviCat) && (!suiviSearch || s.n.toLowerCase().includes(suiviSearch.toLowerCase()) || s.cat.toLowerCase().includes(suiviSearch.toLowerCase())))
    .sort((a, b) => coll.compare(a.cat, b.cat) || coll.compare(a.n, b.n))

  const takenCount = Object.values(day.supps || {}).filter(v => isSuppOn(v as any)).length

  // Base filtered
  const baseFiltered = allSupps
    .filter(s => (!baseCat || s.cat === baseCat) && (!baseSearch || s.n.toLowerCase().includes(baseSearch.toLowerCase()) || s.cat.toLowerCase().includes(baseSearch.toLowerCase()) || (s.desc && s.desc.toLowerCase().includes(baseSearch.toLowerCase()))))
    .sort((a, b) => coll.compare(a.cat, b.cat) || coll.compare(a.n, b.n))

  async function handleAiLookup() {
    if (!aiSuppName.trim()) { setAiSuppError('Veuillez entrer un nom.'); return }
    const k = apiKeyInput.trim() || localStorage.getItem('nj4ak') || ''
    if (!k) { setAiSuppError("Clé API manquante."); return }
    setAiSuppError(''); setAiSuppResult(null); setAiSuppLoading(true)
    try {
      const result = await lookupSupplement(aiSuppName.trim())
      setAiSuppResult(result)
    } catch (e: any) {
      setAiSuppError('Erreur : ' + e.message)
    } finally {
      setAiSuppLoading(false)
    }
  }

  function handleConfirmAiSupp() {
    if (!aiSuppResult) return
    addCustomSupp(aiSuppResult)
    setAiSuppName(''); setAiSuppResult(null)
    setCsFeedback('Supplément ajouté !')
    setTimeout(() => setCsFeedback(''), 2500)
  }

  function handleAddCustomSupp() {
    if (!csName.trim()) { setCsFeedback('Veuillez entrer un nom.'); return }
    const id = 'custom-' + Date.now()
    addCustomSupp({
      id, n: csName.trim(), cat: csCat,
      desc: csPros || 'Supplément personnalisé.',
      pros: csPros.split(',').map(s => s.trim()).filter(Boolean),
      cons: csCons.split(',').map(s => s.trim()).filter(Boolean),
      dose: 'Selon recommandations',
      source: csSource || 'Personnalisé',
    })
    setCsName(''); setCsPros(''); setCsCons(''); setCsSource('')
    setCsFeedback('Supplément ajouté !')
    setTimeout(() => setCsFeedback(''), 2500)
  }

  function handleSaveApiKey() {
    const k = apiKeyInput.trim()
    if (k) { setApiKey(k); localStorage.setItem('nj4ak', k); setApiKeySaved(true) }
  }

  // Group by category for suivi
  let lastSuiviCat = ''
  let lastBaseCat = ''

  return (
    <div style={{ padding: '24px 24px 48px', maxWidth: 1000 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 3, color: 'var(--tx)' }}>Suppléments</div>
      <div style={{ fontSize: 13, color: 'var(--tx2)', marginBottom: 20 }}>
        Suivi journalier · Base FDA/NIH ODS · Fiches avantages & inconvénients
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { id: 'suivi', label: 'Suivi', icon: 'ti-checkbox' },
          { id: 'base', label: 'Base', icon: 'ti-database' },
          { id: 'custom', label: 'Ajouter', icon: 'ti-plus-circle' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSuppTab(tab.id as any)}
            style={{
              padding: '7px 14px', fontSize: 13, border: '0.5px solid var(--bd2)',
              borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
              background: suppTab === tab.id ? 'var(--tx)' : 'none',
              color: suppTab === tab.id ? '#fff' : 'var(--tx2)',
              borderColor: suppTab === tab.id ? 'var(--tx)' : 'var(--bd2)',
            }}
          >
            <i className={`ti ${tab.icon}`} style={{ marginRight: 5 }} />
            {tab.label}
          </button>
        ))}
        <button
          onClick={() => setShowInfo(true)}
          style={{ padding: '7px 14px', fontSize: 13, border: '0.5px solid var(--warn)', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit', background: 'none', color: 'var(--warn)' }}
        >
          <i className="ti ti-info-circle" style={{ marginRight: 5 }} />Sources
        </button>
      </div>

      {/* Suivi tab */}
      {suppTab === 'suivi' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: 17, pointerEvents: 'none' }} />
              <input
                type="text" value={suiviSearch} onChange={e => setSuiviSearch(e.target.value)}
                placeholder="Filtrer…"
                style={{ width: '100%', padding: '10px 14px 10px 38px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--rl)', background: 'var(--surface)', fontSize: 13, color: 'var(--tx)', outline: 'none' }}
              />
            </div>
            <select value={suiviCat} onChange={e => setSuiviCat(e.target.value)}>
              <option value="">Toutes catégories</option>
              {allCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ fontSize: 12, color: 'var(--tx2)', display: 'flex', alignItems: 'center', gap: 5, background: 'var(--s2)', padding: '6px 11px', borderRadius: 'var(--r)' }}>
              <i className="ti ti-check" />{takenCount} pris
            </div>
          </div>
          {suiviFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--tx3)' }}>
              <i className="ti ti-pill" style={{ fontSize: 28, display: 'block', marginBottom: 7 }} />
              Aucun supplément trouvé.
            </div>
          ) : (
            <div>
              {(() => {
                lastSuiviCat = ''
                const groups: React.ReactNode[] = []
                let currentGroup: React.ReactNode[] = []
                suiviFiltered.forEach((s, idx) => {
                  if (s.cat !== lastSuiviCat) {
                    if (currentGroup.length) {
                      const cat = lastSuiviCat
                      groups.push(
                        <div key={cat} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 8, marginBottom: 12 }}>
                          {currentGroup}
                        </div>
                      )
                      currentGroup = []
                    }
                    lastSuiviCat = s.cat
                    groups.push(
                      <div key={`cat-${s.cat}`} style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', padding: '10px 0 5px', borderBottom: '0.5px solid var(--bd)', marginBottom: 8 }}>
                        {s.cat}
                      </div>
                    )
                  }
                  const on = isSuppOn(day.supps[s.id] as any)
                  currentGroup.push(
                    <div
                      key={s.id}
                      onClick={() => toggleSupp(currentDate, s.id, !on)}
                      style={{
                        background: on ? 'var(--bgluc)' : 'var(--surface)',
                        border: `0.5px solid ${on ? 'var(--gluc)' : 'var(--bd)'}`,
                        borderRadius: 'var(--r)', padding: '11px 13px',
                        display: 'flex', alignItems: 'center', gap: 9,
                        cursor: 'pointer', transition: 'all .15s', userSelect: 'none',
                      }}
                    >
                      <div style={{
                        width: 20, height: 20, border: `1.5px solid ${on ? 'var(--gluc)' : 'var(--bd2)'}`,
                        borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, flexShrink: 0, transition: 'all .15s',
                        background: on ? 'var(--gluc)' : 'transparent', color: on ? '#fff' : 'transparent',
                      }}>
                        {on && '✓'}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.3, color: 'var(--tx)' }}>{s.n}</div>
                    </div>
                  )
                  if (idx === suiviFiltered.length - 1 && currentGroup.length) {
                    groups.push(
                      <div key={`last-group`} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 8, marginBottom: 12 }}>
                        {currentGroup}
                      </div>
                    )
                  }
                })
                return groups
              })()}
            </div>
          )}
        </div>
      )}

      {/* Base tab */}
      {suppTab === 'base' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
              <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: 17, pointerEvents: 'none' }} />
              <input
                type="text" value={baseSearch} onChange={e => setBaseSearch(e.target.value)}
                placeholder="Rechercher…"
                style={{ width: '100%', padding: '10px 14px 10px 38px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--rl)', background: 'var(--surface)', fontSize: 13, color: 'var(--tx)', outline: 'none' }}
              />
            </div>
            <select value={baseCat} onChange={e => setBaseCat(e.target.value)}>
              <option value="">Toutes catégories</option>
              {allCats.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div style={{ fontSize: 12, color: 'var(--tx2)', display: 'flex', alignItems: 'center', gap: 5, background: 'var(--s2)', padding: '6px 11px', borderRadius: 'var(--r)' }}>
              <i className="ti ti-list" />{baseFiltered.length}
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 12, lineHeight: 1.6 }}>
            Cliquez sur un supplément pour voir sa fiche complète.
          </p>
          {baseFiltered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--tx3)' }}>Aucun supplément trouvé.</div>
          ) : (
            <div>
              {(() => {
                lastBaseCat = ''
                return baseFiltered.map((s, idx) => {
                  const catHeader = s.cat !== lastBaseCat ? (
                    <div key={`bcat-${s.cat}`} style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.07em', padding: '10px 0 5px', borderBottom: '0.5px solid var(--bd)', marginBottom: 8 }}>
                      {s.cat}
                    </div>
                  ) : null
                  if (catHeader) lastBaseCat = s.cat
                  const on = isSuppOn(day.supps[s.id] as any)
                  return (
                    <React.Fragment key={s.id}>
                      {catHeader}
                      <div style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--r)', padding: '11px 13px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, flex: 1, cursor: 'pointer', color: 'var(--tx)' }} onClick={() => setDetailSupp(s)}>
                            {s.n}
                          </div>
                          <button
                            onClick={() => toggleSupp(currentDate, s.id, !on)}
                            style={{ background: on ? 'var(--gluc)' : 'var(--s2)', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: on ? '#fff' : 'var(--tx2)', flexShrink: 0, fontFamily: 'inherit' }}
                          >
                            {on ? '✓ Pris' : '+ Cocher'}
                          </button>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 4 }}>{s.cat}</div>
                        <div style={{ fontSize: 11, color: 'var(--tx2)', lineHeight: 1.5, cursor: 'pointer' }} onClick={() => setDetailSupp(s)}>
                          {(s.desc || '').substring(0, 85)}{(s.desc || '').length > 85 ? '…' : ''}
                        </div>
                        <div style={{ marginTop: 6, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {(s.pros || []).slice(0, 2).map(p => (
                            <span key={p} style={{ fontSize: 10, background: 'var(--bgluc)', color: 'var(--gluc)', padding: '2px 7px', borderRadius: 20 }}>
                              ✓ {p.substring(0, 22)}{p.length > 22 ? '…' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    </React.Fragment>
                  )
                })
              })()}
            </div>
          )}
        </div>
      )}

      {/* Custom / Add tab */}
      {suppTab === 'custom' && (
        <div>
          {/* AI lookup */}
          <div style={{ background: 'var(--bgluc)', borderRadius: 'var(--rl)', padding: 16, marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-sparkles" style={{ color: 'var(--gluc)' }} />
              Recherche automatique par IA
            </div>
            <p style={{ fontSize: 12, color: 'var(--tx2)', margin: '0 0 12px', lineHeight: 1.6 }}>
              Tapez un nom de supplément, l'IA remplit automatiquement toutes les informations.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
                <i className="ti ti-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)', fontSize: 17, pointerEvents: 'none' }} />
                <input
                  type="text" value={aiSuppName} onChange={e => setAiSuppName(e.target.value)}
                  placeholder="Ex: Ashwagandha, Spiruline, L-Carnitine…"
                  onKeyDown={e => e.key === 'Enter' && handleAiLookup()}
                  style={{ width: '100%', padding: '10px 14px 10px 38px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--rl)', background: 'var(--surface)', fontSize: 13, color: 'var(--tx)', outline: 'none' }}
                />
              </div>
              <button onClick={handleAiLookup} disabled={aiSuppLoading} className="btn btn-g">
                <i className="ti ti-sparkles" />{aiSuppLoading ? 'Recherche…' : 'Rechercher'}
              </button>
            </div>
            {aiSuppLoading && <div style={{ fontSize: 13, color: 'var(--tx2)', padding: '6px 0' }}><i className="ti ti-loader" style={{ marginRight: 6 }} />L'IA recherche les informations…</div>}
            {aiSuppError && <div style={{ fontSize: 12, color: 'var(--danger)', padding: '5px 0' }}>{aiSuppError}</div>}
            {aiSuppResult && (
              <div style={{ marginTop: 10, background: 'var(--surface)', borderRadius: 'var(--r)', padding: 14, border: '0.5px solid var(--bd2)' }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--tx)' }}>
                  <i className="ti ti-sparkles" style={{ color: 'var(--gluc)', marginRight: 6 }} />{aiSuppResult.n}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--gluc)', marginBottom: 8 }}>{aiSuppResult.cat}</div>
                <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 10, lineHeight: 1.5 }}>{aiSuppResult.desc}</div>
                {aiSuppResult.pros.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ok)', marginBottom: 4 }}>✓ Bénéfices</div>
                    {aiSuppResult.pros.map(b => <div key={b} style={{ fontSize: 12, color: 'var(--tx2)', padding: '2px 0' }}>• {b}</div>)}
                  </div>
                )}
                {aiSuppResult.cons.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--warn)', marginBottom: 4 }}>⚠ Précautions</div>
                    {aiSuppResult.cons.map(c => <div key={c} style={{ fontSize: 12, color: 'var(--tx2)', padding: '2px 0' }}>• {c}</div>)}
                  </div>
                )}
                <div style={{ fontSize: 12, color: 'var(--tx2)', marginBottom: 4 }}>
                  <i className="ti ti-pill" style={{ marginRight: 5, color: 'var(--kcal)' }} /><strong>Dose :</strong> {aiSuppResult.dose}
                </div>
                {aiSuppResult.source && <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 12 }}>Sources : {aiSuppResult.source}</div>}
                <button onClick={handleConfirmAiSupp} className="btn btn-g" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="ti ti-check" />Ajouter ce supplément
                </button>
              </div>
            )}
            {/* API Key */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--bd)' }}>
              <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 6 }}>Clé API Anthropic requise</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)}
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

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: '.5px', background: 'var(--bd2)' }} />
            <span style={{ fontSize: 11, color: 'var(--tx3)', whiteSpace: 'nowrap' }}>ou remplissez manuellement</span>
            <div style={{ flex: 1, height: '.5px', background: 'var(--bd2)' }} />
          </div>

          {/* Manual form */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, color: 'var(--tx2)', display: 'block', marginBottom: 3 }}>Nom *</label>
              <input
                type="text" value={csName} onChange={e => setCsName(e.target.value)}
                placeholder="Ex: Spiruline…"
                style={{ width: '100%', padding: '8px 9px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, background: 'var(--surface)', color: 'var(--tx)' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: 'var(--tx2)', display: 'block', marginBottom: 3 }}>Catégorie</label>
              <select value={csCat} onChange={e => setCsCat(e.target.value)} style={{ width: '100%' }}>
                {SUPP_CATS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, color: 'var(--tx2)', display: 'block', marginBottom: 3 }}>Bénéfices (optionnel)</label>
              <input
                type="text" value={csPros} onChange={e => setCsPros(e.target.value)}
                placeholder="Ex: Énergie, immunité…"
                style={{ width: '100%', padding: '8px 9px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, background: 'var(--surface)', color: 'var(--tx)' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, color: 'var(--tx2)', display: 'block', marginBottom: 3 }}>Précautions (optionnel)</label>
              <input
                type="text" value={csCons} onChange={e => setCsCons(e.target.value)}
                placeholder="Ex: Interactions…"
                style={{ width: '100%', padding: '8px 9px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, background: 'var(--surface)', color: 'var(--tx)' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 10, color: 'var(--tx2)', display: 'block', marginBottom: 3 }}>Source (optionnel)</label>
              <input
                type="text" value={csSource} onChange={e => setCsSource(e.target.value)}
                placeholder="Ex: NIH, médecin…"
                style={{ width: '100%', padding: '8px 9px', border: '0.5px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, background: 'var(--surface)', color: 'var(--tx)' }}
              />
            </div>
          </div>
          <button onClick={handleAddCustomSupp} className="btn btn-g">
            <i className="ti ti-plus" />Ajouter manuellement
          </button>
          {csFeedback && <div style={{ fontSize: 12, color: 'var(--gluc)', marginTop: 8 }}>{csFeedback}</div>}

          {/* Custom supps list */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '.08em', margin: '22px 0 10px' }}>
            Mes suppléments personnalisés
          </div>
          {customSupps.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--tx3)', padding: '8px 0' }}>Aucun supplément personnalisé.</div>
          ) : (
            customSupps.map(s => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '0.5px solid var(--bd)', borderRadius: 'var(--r)', padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)' }}>{s.cat}</div>
                </div>
                <button
                  onClick={() => deleteCustomSupp(s.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)', fontSize: 16, padding: 4 }}
                >
                  <i className="ti ti-trash" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail overlay */}
      {detailSupp && (
        <SuppDetailOverlay
          supp={detailSupp}
          onClose={() => setDetailSupp(null)}
          isOn={isSuppOn(day.supps[detailSupp.id] as any)}
          onToggle={() => {
            const on = isSuppOn(day.supps[detailSupp.id] as any)
            toggleSupp(currentDate, detailSupp.id, !on)
          }}
        />
      )}

      {/* Sources overlay */}
      {showInfo && (
        <div
          style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 200, alignItems: 'flex-start', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
          onClick={e => { if (e.target === e.currentTarget) setShowInfo(false) }}
        >
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--rx)', padding: '26px 28px', maxWidth: 640, width: '100%', margin: 'auto', position: 'relative' }}>
            <button onClick={() => setShowInfo(false)} style={{ position: 'absolute', top: 14, right: 14, background: 'var(--s2)', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--tx3)', width: 34, height: 34, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="ti ti-x" />
            </button>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 9 }}>
              <i className="ti ti-shield-check" style={{ color: 'var(--warn)', fontSize: 22 }} />
              Sources & Avertissements
            </div>
            <div style={{ fontSize: 12, color: 'var(--tx3)', marginBottom: 18 }}>Informations scientifiques · Transparence · Usage responsable</div>
            <div style={{ background: 'var(--bprot)', borderLeft: '3px solid var(--prot)', borderRadius: 'var(--r)', padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>⚠ Avertissement médical important</div>
              <div style={{ fontSize: 12, color: 'var(--tx)', lineHeight: 1.7 }}>
                <strong>Cette application n'est pas un outil médical.</strong> Les informations ont une visée éducative uniquement. Consultez toujours un médecin avant tout protocole de supplémentation.
              </div>
            </div>
            <button onClick={() => setShowInfo(false)} className="btn btn-g" style={{ width: '100%', justifyContent: 'center', padding: 10 }}>
              <i className="ti ti-check" /> Compris — Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
