/**
 * Squelette des évaluations.
 *
 * La session d'évaluation charge les cartes dues avant d'afficher quoi que ce
 * soit. Le squelette reprend la géométrie de la carte pour que rien ne saute
 * quand le contenu arrive.
 */
export default function EvalLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 py-10 animate-pulse" aria-hidden>
      {/* Progression */}
      <div className="h-2 w-full max-w-sm rounded-pill bg-sky-cloud dark:bg-night-border" />

      {/* Carte à réviser */}
      <div className="h-64 w-full rounded-card bg-sky-cloud dark:bg-night-border" />

      {/* Boutons de notation */}
      <div className="grid w-full max-w-lg grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-12 rounded-input bg-sky-cloud dark:bg-night-border" />
        ))}
      </div>
    </div>
  )
}
