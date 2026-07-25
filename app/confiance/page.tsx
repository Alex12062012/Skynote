import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Ban, Users, Dice5, MessagesSquare, Server, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confiance & sécurité — Skynote',
  description:
    "Ce que Skynote fait et ne fait pas avec les données des élèves : pas de publicité, pas de mécanique de hasard, pas de messagerie entre élèves. Explications en langage clair.",
}

/**
 * PAGE DE CONFIANCE — publique, hors dashboard.
 *
 * Règle d'écriture : chaque affirmation de cette page doit être vérifiable
 * dans le code ou dans l'historique Git. Pas de promesse générale, pas de
 * vocabulaire marketing. Quand une garantie a une limite, la limite est
 * écrite juste à côté de la garantie.
 *
 * Sources vérifiées à la rédaction :
 *   - absence de SDK publicitaire/analytics : package.json + recherche
 *     globale (aucun Google Analytics, Meta Pixel, PostHog, Mixpanel…)
 *   - sous-traitants : next.config.mjs (CSP connect-src), sentry.*.config.ts,
 *     app/privacy §4 et §5
 *   - consentement parental : components/auth/SignupForm.tsx + migration
 *     012_birth_date_grade.sql
 *   - suppression de la roue : migration 030_mastery_chests.sql,
 *     lib/gamification/config.ts (en-tête), commit a309388 du 25/07/2026
 *   - absence de messagerie : aucune table de messages/commentaires dans
 *     supabase/migrations
 */
export default function ConfiancePage() {
  return (
    <div className="min-h-screen bg-sky-bg px-4 py-12 dark:bg-night-bg">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-body text-[14px] text-text-secondary transition-colors hover:text-text-main dark:text-text-dark-secondary dark:hover:text-text-dark-main"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-brand dark:text-brand-dark" />
          <h1 className="font-display text-h2 text-text-main dark:text-text-dark-main">
            Confiance &amp; sécurité
          </h1>
        </div>
        <p className="mb-10 font-body text-[14px] text-text-tertiary dark:text-text-dark-tertiary">
          Dernière mise à jour : juillet 2026
        </p>

        <p className="mb-10 font-body text-[15px] leading-relaxed text-text-main dark:text-text-dark-main">
          Skynote est utilisé par des élèves de 10 à 17 ans. Cette page explique en
          langage simple comment l&apos;app est construite&nbsp;: ce qu&apos;elle fait de
          tes données, ce qu&apos;elle ne fait pas, et où sont les limites de ce
          qu&apos;on peut te garantir. Le détail juridique complet est dans la{' '}
          <Link href="/privacy" className="text-brand hover:underline dark:text-brand-dark">
            politique de confidentialité
          </Link>{' '}
          et les{' '}
          <Link href="/mentions-legales" className="text-brand hover:underline dark:text-brand-dark">
            mentions légales
          </Link>
          .
        </p>

        <div className="space-y-10 font-body text-[15px] leading-relaxed text-text-main dark:text-text-dark-main">

          {/* ─── 1. Publicité et pistage ─────────────────────────────────── */}
          <Section icon={Ban} title="Aucune publicité, aucun pistage marketing">
            <p>
              Skynote ne contient <strong>aucun espace publicitaire</strong> et{' '}
              <strong>aucun outil de mesure d&apos;audience ou de pistage marketing</strong>&nbsp;:
              pas de Google Analytics, pas de pixel Meta, pas de régie publicitaire,
              pas de cookie publicitaire. Tes données ne sont ni vendues, ni louées,
              ni transmises à des annonceurs.
            </p>
            <p className="mt-2">
              Techniquement, l&apos;application est verrouillée par une règle de sécurité
              (Content Security Policy) qui limite les serveurs auxquels ton navigateur
              a le droit de parler. Cette liste est courte et publique&nbsp;: elle ne
              contient aucun domaine publicitaire.
            </p>
            <Nuance>
              Un outil de suivi technique existe malgré tout, et il est décrit
              honnêtement juste en dessous — ce n&apos;est pas de la publicité, mais
              ce n&apos;est pas «&nbsp;rien du tout&nbsp;» non plus.
            </Nuance>
          </Section>

          {/* ─── 2. Sous-traitants ───────────────────────────────────────── */}
          <Section icon={Server} title="Les entreprises qui interviennent">
            <p>
              Faire fonctionner Skynote demande quelques prestataires techniques. Voici
              la liste complète et ce que chacun voit&nbsp;:
            </p>

            <div className="mt-4 space-y-3">
              <Processor
                name="Anthropic (Claude)"
                role="Génère les fiches, les QCM et les réponses du chat"
                detail="Reçoit le contenu du cours que tu envoies, le temps de la génération. Ce contenu n'est pas utilisé pour entraîner ses modèles. Encadré par des clauses contractuelles types (SCC) conformes au RGPD."
              />
              <Processor
                name="Supabase"
                role="Base de données et comptes"
                detail="Stocke ton compte, tes cours, tes fiches et ta progression. Infrastructure AWS, région Europe (Irlande)."
              />
              <Processor
                name="Vercel"
                role="Hébergement de l'application"
                detail="Sert les pages du site. Traite les données techniques de connexion nécessaires à l'affichage."
              />
              <Processor
                name="Sentry"
                role="Détection des bugs"
                detail="Reçoit les erreurs techniques pour qu'elles soient corrigées. Enregistre aussi un rejeu de l'interface sur une petite partie des sessions et sur les sessions où une erreur se produit, afin de reproduire le problème."
              />
            </div>

            <Nuance>
              Le rejeu de session de Sentry est un enregistrement de ce qui s&apos;affiche
              à l&apos;écran pendant que tu utilises l&apos;app. Il sert uniquement à
              comprendre des bugs, jamais à analyser ton comportement à des fins
              commerciales — mais c&apos;est bien une donnée qui sort de l&apos;app, donc
              elle figure ici plutôt que d&apos;être passée sous silence.
            </Nuance>
          </Section>

          {/* ─── 3. Âge et consentement parental ─────────────────────────── */}
          <Section icon={Users} title="Âge et accord des parents">
            <p>
              La date de naissance est demandée à l&apos;inscription, et elle détermine
              la suite&nbsp;:
            </p>
            <ul className="mt-3 space-y-2 pl-4 text-[14px] list-disc">
              <li>
                <strong>Moins de 10 ans</strong>&nbsp;: l&apos;inscription est refusée.
              </li>
              <li>
                <strong>De 10 à 14 ans</strong>&nbsp;: l&apos;adresse e-mail d&apos;un
                parent est obligatoire, et elle doit être différente de celle de
                l&apos;élève. Le code de connexion à 6 chiffres est envoyé{' '}
                <strong>au parent, pas à l&apos;enfant</strong>. En transmettant ce code,
                le parent autorise l&apos;inscription et accepte les conditions au nom de
                son enfant (article 8 du RGPD).
              </li>
              <li>
                <strong>15 ans et plus</strong>&nbsp;: l&apos;élève peut s&apos;inscrire
                et consentir seul, comme le prévoit la loi française.
              </li>
            </ul>
            <Nuance>
              Ce que ce mécanisme <strong>ne garantit pas</strong>&nbsp;: la date de
              naissance et l&apos;adresse du parent sont déclaratives. Rien ne vérifie
              qu&apos;elles sont exactes. Un élève qui saisit une fausse date de
              naissance, ou l&apos;adresse d&apos;un deuxième compte à lui, contournera
              le contrôle. Ce dispositif rend le passage par un parent obligatoire dans
              le parcours normal&nbsp;; il ne prétend pas être une vérification
              d&apos;identité.
            </Nuance>
          </Section>

          {/* ─── 4. Pas de hasard ────────────────────────────────────────── */}
          <Section icon={Dice5} title="Aucune mécanique de hasard">
            <p>
              Aucune récompense de Skynote ne dépend de la chance, et il n&apos;existe
              aucun objet à acheter dont le contenu serait tiré au sort.
            </p>
            <p className="mt-2">
              Ça n&apos;a pas toujours été le cas.{' '}
              <strong>
                Jusqu&apos;au 25 juillet 2026, la boutique contenait une «&nbsp;roue de
                la fortune&nbsp;»
              </strong>{' '}
              : elle coûtait 50&nbsp;Sky&nbsp;Coins par tour, le résultat était tiré au
              sort, et environ un tour sur trois ne donnait rien. Cette mécanique a été
              supprimée ce jour-là, pour une raison simple&nbsp;: sur un public mineur,
              elle a exactement la forme d&apos;une <em>loot box</em> — une mise
              obligatoire, un résultat inconnu à l&apos;avance et une incitation à
              recommencer. Plusieurs pays européens les assimilent à des jeux de hasard.
            </p>
            <p className="mt-2">
              Elle a été remplacée par les <strong>Coffres de Maîtrise</strong>, qui
              fonctionnent à l&apos;inverse&nbsp;:
            </p>
            <ul className="mt-3 space-y-2 pl-4 text-[14px] list-disc">
              <li>un coffre est débloqué tous les 5 QCM réussis en 5/5&nbsp;;</li>
              <li>il est <strong>gratuit</strong>&nbsp;: aucune monnaie n&apos;est misée pour l&apos;ouvrir&nbsp;;</li>
              <li>
                son contenu est <strong>affiché avant l&apos;ouverture</strong>, et la
                suite des récompenses est un cycle fixe&nbsp;: tu peux lire aujourd&apos;hui
                ce que donnera ton douzième coffre&nbsp;;
              </li>
              <li>il n&apos;existe pas de résultat «&nbsp;perdu&nbsp;» : l&apos;effort fourni donne toujours quelque chose.</li>
            </ul>
          </Section>

          {/* ─── 5. Pas de messagerie entre élèves ───────────────────────── */}
          <Section icon={MessagesSquare} title="Aucune discussion entre élèves">
            <p>
              Skynote n&apos;a <strong>ni messagerie privée, ni forum, ni commentaires,
              ni fil d&apos;actualité</strong>. Il n&apos;existe aucun moyen pour un
              utilisateur d&apos;envoyer un message à un autre. Il n&apos;y a donc pas de
              surface de harcèlement entre élèves à surveiller, parce qu&apos;il n&apos;y
              a pas d&apos;espace de discussion du tout.
            </p>
            <p className="mt-2">
              Les seules choses partagées entre comptes sont le{' '}
              <strong>classement</strong> (un pseudo choisi par l&apos;élève et un nombre
              de points), un bouton «&nbsp;j&apos;aime&nbsp;» sur les profils, et les
              liens de partage de cours que tu décides d&apos;envoyer toi-même.
            </p>
            <Nuance>
              Le pseudo affiché dans le classement est du texte libre choisi par
              l&apos;élève. C&apos;est le seul texte visible par les autres, et il peut
              être signalé.
            </Nuance>
          </Section>

          {/* ─── 6. Ce que l'IA produit ──────────────────────────────────── */}
          <Section icon={Sparkles} title="Ce que l'IA produit, et ses limites">
            <p>
              Les fiches, les QCM et les corrections sont générés automatiquement à
              partir <strong>de ton propre cours</strong>. L&apos;IA peut se tromper&nbsp;:
              rien de ce qu&apos;elle produit ne remplace ton manuel ou ton professeur.
            </p>
            <p className="mt-2">
              Les notes sur 20 et les mentions affichées après une mini-épreuve brevet
              sont des <strong>estimations générées par l&apos;IA</strong>. Ce ne sont pas
              des notes officielles et elles ne préjugent pas du résultat réel à
              l&apos;examen. Cette précision est affichée directement sur chaque carte de
              résultat, pas seulement dans les conditions d&apos;utilisation.
            </p>
          </Section>

          {/* ─── Pour aller plus loin ────────────────────────────────────── */}
          <section className="rounded-card border border-sky-border bg-sky-surface p-5 dark:border-night-border dark:bg-night-surface">
            <h2 className="mb-2 font-display text-[17px] font-bold text-text-main dark:text-text-dark-main">
              Le détail complet
            </h2>
            <p className="text-[14px] text-text-secondary dark:text-text-dark-secondary">
              Cette page est un résumé en langage clair. Les textes de référence, qui
              font foi, sont&nbsp;:
            </p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[14px]">
              <Link href="/privacy" className="text-brand hover:underline dark:text-brand-dark">
                Politique de confidentialité
              </Link>
              <Link href="/terms" className="text-brand hover:underline dark:text-brand-dark">
                Conditions d&apos;utilisation
              </Link>
              <Link href="/mentions-legales" className="text-brand hover:underline dark:text-brand-dark">
                Mentions légales
              </Link>
            </div>
            <p className="mt-4 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              Une question, un doute, une erreur à signaler sur cette page&nbsp;?{' '}
              <a href="mailto:contact@skynote.app" className="text-brand hover:underline dark:text-brand-dark">
                contact@skynote.app
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon: Icon, title, children,
}: {
  icon: React.ElementType
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-display text-[20px] font-bold text-text-main dark:text-text-dark-main">
        <Icon className="h-5 w-5 flex-shrink-0 text-brand dark:text-brand-dark" />
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Encadré « ce que ça ne garantit pas » — la nuance vit à côté de la promesse. */
function Nuance({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 rounded-input border-l-2 border-amber-400 bg-amber-50 px-4 py-2.5 text-[13px] leading-relaxed text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
      {children}
    </p>
  )
}

function Processor({ name, role, detail }: { name: string; role: string; detail: string }) {
  return (
    <div className="rounded-input border border-sky-border bg-sky-surface px-4 py-3 dark:border-night-border dark:bg-night-surface">
      <p className="font-display text-[15px] font-bold text-text-main dark:text-text-dark-main">
        {name}
      </p>
      <p className="text-[13px] font-medium text-brand dark:text-brand-dark">{role}</p>
      <p className="mt-1 text-[13px] text-text-secondary dark:text-text-dark-secondary">{detail}</p>
    </div>
  )
}
