/**
 * Squelette de la page brevet.
 *
 * C'est la page où l'attente est la plus longue de l'app : vérification du
 * quota, lecture des sessions passées, puis génération de l'épreuve. Un écran
 * blanc à cet endroit laisse croire que l'application a planté.
 */
export default function BrevetLoading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse" aria-hidden>
      <div className="mb-8 space-y-3 text-center">
        <div className="mx-auto h-9 w-64 rounded-input bg-sky-cloud dark:bg-night-border" />
        <div className="mx-auto h-4 w-80 max-w-full rounded-input bg-sky-cloud dark:bg-night-border" />
      </div>

      {/* Carte de lancement */}
      <div className="h-56 rounded-card bg-sky-cloud dark:bg-night-border" />

      {/* Historique des sessions */}
      <div className="mt-8 space-y-3">
        <div className="h-5 w-44 rounded-input bg-sky-cloud dark:bg-night-border" />
        {[0, 1, 2].map(i => (
          <div key={i} className="h-16 rounded-card bg-sky-cloud dark:bg-night-border" />
        ))}
      </div>
    </div>
  )
}
