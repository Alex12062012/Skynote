/**
 * Squelette du tableau de bord.
 *
 * La page enchaîne plusieurs requêtes Supabase avant de rendre quoi que ce
 * soit : sans ce fichier, l'élève voit une page blanche pendant ce temps.
 * Un squelette qui reprend la géométrie réelle évite aussi le décalage de
 * mise en page à l'arrivée du contenu (CLS).
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse" aria-hidden>
      {/* Salutation + bouton nouveau cours */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-56 rounded-input bg-sky-cloud dark:bg-night-border" />
          <div className="h-4 w-40 rounded-input bg-sky-cloud dark:bg-night-border" />
        </div>
        <div className="h-12 w-full rounded-pill bg-sky-cloud dark:bg-night-border sm:w-44" />
      </div>

      {/* Barre de stats — 4 tuiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-[76px] rounded-card bg-sky-cloud dark:bg-night-border" />
        ))}
      </div>

      {/* Bannière brevet */}
      <div className="h-[84px] rounded-card bg-sky-cloud dark:bg-night-border" />

      {/* Cours récents */}
      <div className="space-y-4">
        <div className="h-6 w-40 rounded-input bg-sky-cloud dark:bg-night-border" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-44 rounded-card bg-sky-cloud dark:bg-night-border" />
          ))}
        </div>
      </div>
    </div>
  )
}
