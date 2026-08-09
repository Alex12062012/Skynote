'use client'

import { useEffect, useState } from 'react'
import { Ticket, Loader2, Check, X } from 'lucide-react'

/**
 * Gestion des codes promo (admin).
 *
 * Cet écran n'est pas une protection : la route /api/admin/promo revérifie
 * l'identité admin à chaque appel. Ici on ne fait que présenter et pré-valider
 * pour donner des messages clairs.
 */

type PromoCode = {
  id: string
  code: string
  label: string | null
  bonus_novas: number
  starter_month: number
  pro_month: number
  max_uses: number
  uses_count: number
  expires_at: string | null
  active: boolean
  created_at: string
}

const VIDE = {
  code: '', label: '', bonus_novas: '0',
  starter_month: '0', pro_month: '0', max_uses: '1', expires_at: '',
}

export function PromoCodesPanel() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [form, setForm] = useState({ ...VIDE })
  const [chargement, setChargement] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  async function charger() {
    setChargement(true)
    try {
      const r = await fetch('/api/admin/promo')
      const j = await r.json()
      setCodes(j.codes ?? [])
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [])

  async function creer(e: React.FormEvent) {
    e.preventDefault()
    setErreur(''); setSucces(''); setEnvoi(true)
    try {
      const r = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          label: form.label,
          bonus_novas: Number(form.bonus_novas),
          starter_month: Number(form.starter_month),
          pro_month: Number(form.pro_month),
          max_uses: Number(form.max_uses),
          expires_at: form.expires_at || null,
        }),
      })
      const j = await r.json()
      if (!r.ok) { setErreur(j.error ?? 'Erreur'); return }
      setSucces(`Code ${j.code.code} créé.`)
      setForm({ ...VIDE })
      charger()
    } finally {
      setEnvoi(false)
    }
  }

  async function basculer(c: PromoCode) {
    await fetch('/api/admin/promo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, active: !c.active }),
    })
    charger()
  }

  const champ = 'w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[13px] text-slate-100 focus:border-blue-500 focus:outline-none'
  const label = 'block mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400'

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-slate-100">
        <Ticket className="h-4 w-4" aria-hidden />
        Codes promo
      </h2>

      <form onSubmit={creer} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <label className={label} htmlFor="promo-code">Code</label>
          <input id="promo-code" required className={champ} value={form.code}
            placeholder="RENTREE2026" maxLength={32} autoComplete="off"
            onChange={e => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') })} />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="promo-label">Mémo interne</label>
          <input id="promo-label" className={champ} value={form.label} maxLength={120}
            placeholder="Partenariat collège X"
            onChange={e => setForm({ ...form, label: e.target.value })} />
        </div>

        <div>
          <label className={label} htmlFor="promo-novas">Novas en plus</label>
          <input id="promo-novas" type="number" min={0} max={100000} className={champ}
            value={form.bonus_novas}
            onChange={e => setForm({ ...form, bonus_novas: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="promo-starter">Mois Starter</label>
          <input id="promo-starter" type="number" min={0} max={24} className={champ}
            value={form.starter_month}
            onChange={e => setForm({ ...form, starter_month: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="promo-pro">Mois Pro</label>
          <input id="promo-pro" type="number" min={0} max={24} className={champ}
            value={form.pro_month}
            onChange={e => setForm({ ...form, pro_month: e.target.value })} />
        </div>
        <div>
          <label className={label} htmlFor="promo-max">Utilisations max</label>
          <input id="promo-max" type="number" min={1} max={100000} required className={champ}
            value={form.max_uses}
            onChange={e => setForm({ ...form, max_uses: e.target.value })} />
        </div>

        <div className="sm:col-span-2">
          <label className={label} htmlFor="promo-exp">Expire le (optionnel)</label>
          <input id="promo-exp" type="date" className={champ} value={form.expires_at}
            onChange={e => setForm({ ...form, expires_at: e.target.value })} />
        </div>

        <div className="flex items-end sm:col-span-2">
          <button type="submit" disabled={envoi}
            className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-blue-600 px-4 text-[13px] font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
            {envoi && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Créer le code
          </button>
        </div>

        {erreur && <p role="alert" className="sm:col-span-4 text-[13px] text-red-400">{erreur}</p>}
        {succes && <p role="status" className="sm:col-span-4 text-[13px] text-emerald-400">{succes}</p>}
      </form>

      {chargement ? (
        <p className="text-[13px] text-slate-400">Chargement…</p>
      ) : codes.length === 0 ? (
        <p className="text-[13px] text-slate-400">Aucun code pour l&apos;instant.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                <th className="py-2 pr-4">Code</th>
                <th className="py-2 pr-4">Accorde</th>
                <th className="py-2 pr-4">Utilisé</th>
                <th className="py-2 pr-4">Expire</th>
                <th className="py-2 pr-4">État</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {codes.map(c => {
                const epuise = c.uses_count >= c.max_uses
                return (
                  <tr key={c.id} className="border-t border-slate-800">
                    <td className="py-2.5 pr-4">
                      <span className="font-mono font-bold text-slate-100">{c.code}</span>
                      {c.label && <span className="block text-[11px] text-slate-500">{c.label}</span>}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-300">
                      {[
                        c.bonus_novas > 0 && `${c.bonus_novas} Novas`,
                        c.starter_month > 0 && `${c.starter_month} mois Starter`,
                        c.pro_month > 0 && `${c.pro_month} mois Pro`,
                      ].filter(Boolean).join(' · ')}
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums text-slate-300">
                      {c.uses_count} / {c.max_uses}
                    </td>
                    <td className="py-2.5 pr-4 text-slate-400">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="py-2.5 pr-4">
                      {epuise ? (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">Épuisé</span>
                      ) : c.active ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-900/40 px-2 py-0.5 text-[11px] text-emerald-400">
                          <Check className="h-3 w-3" aria-hidden /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">
                          <X className="h-3 w-3" aria-hidden /> Désactivé
                        </span>
                      )}
                    </td>
                    <td className="py-2.5">
                      <button onClick={() => basculer(c)}
                        className="rounded-lg border border-slate-700 px-2.5 py-1 text-[12px] text-slate-300 hover:border-slate-500">
                        {c.active ? 'Désactiver' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
