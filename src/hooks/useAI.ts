import { usePreferencesStore } from '../store/usePreferencesStore'
import type { Food, Supplement } from '../types'

const SUPP_CATEGORIES = [
  'Vitamines','Minéraux','Acides aminés','Plantes & Adaptogènes','Acides gras',
  'Probiotiques & Prébiotiques','Enzymes & Cofacteurs','Antioxydants','Nootropiques',
  'Sport & Performance','Autre',
]

export function useAI() {
  const { apiKey } = usePreferencesStore()

  async function callAnthropic(prompt: string, maxTokens = 300): Promise<string> {
    const key = apiKey || localStorage.getItem('nj4ak') || ''
    if (!key) throw new Error('Clé API manquante. Entrez votre clé Anthropic dans les paramètres.')

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Erreur API: ${resp.status}`)
    }

    const data = await resp.json()
    const text = data?.content?.[0]?.text || ''
    return text
  }

  async function lookupFood(name: string, category: string): Promise<Food> {
    const prompt = `Valeurs nutritionnelles moyennes pour 100g de "${name}" selon FDA/USDA. Réponds UNIQUEMENT avec ce JSON valide sans markdown:\n{"nom":"${name}","kcal":0,"glucides":0,"lipides":0,"proteines":0,"note":"source courte"}`
    const text = await callAnthropic(prompt, 200)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("Réponse inattendue de l'IA")
    const parsed = JSON.parse(match[0])
    return {
      n: parsed.nom || name,
      c: category,
      k: parseFloat(parsed.kcal) || 0,
      g: parseFloat(parsed.glucides) || 0,
      l: parseFloat(parsed.lipides) || 0,
      p: parseFloat(parsed.proteines) || 0,
      _custom: true,
    }
  }

  async function lookupSupplement(name: string): Promise<Supplement & { note?: string }> {
    const prompt = `Informations scientifiques sur le supplément alimentaire "${name}". Réponds UNIQUEMENT avec ce JSON valide sans markdown:\n{"nom":"${name}","categorie":"Autre","description":"description courte 1-2 phrases","benefices":["bénéfice 1","bénéfice 2","bénéfice 3"],"precautions":["précaution 1","précaution 2"],"dose":"dose recommandée avec unité","source":"sources scientifiques courtes"}\nCatégories possibles: ${SUPP_CATEGORIES.join(', ')}.`
    const text = await callAnthropic(prompt, 400)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("Réponse inattendue de l'IA")
    const parsed = JSON.parse(match[0])
    return {
      id: 'custom-' + Date.now(),
      n: parsed.nom || name,
      cat: SUPP_CATEGORIES.includes(parsed.categorie) ? parsed.categorie : 'Autre',
      desc: parsed.description || '',
      pros: Array.isArray(parsed.benefices) ? parsed.benefices : [],
      cons: Array.isArray(parsed.precautions) ? parsed.precautions : [],
      dose: parsed.dose || 'Selon recommandations',
      source: parsed.source || 'IA NutriJournal',
    }
  }

  return { lookupFood, lookupSupplement, hasApiKey: !!(apiKey || localStorage.getItem('nj4ak')) }
}
