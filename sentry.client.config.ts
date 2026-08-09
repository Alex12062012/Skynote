import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  integrations: [
    // Masquage à la source, NON NÉGOCIABLE : le rejeu de session est expurgé
    // dans le navigateur AVANT d'être envoyé à Sentry. Les textes sont
    // remplacés par des blocs et les images/médias sont bloqués.
    // Skynote est utilisé par des mineurs (10-17 ans) qui téléversent des
    // photos de cours et des copies manuscrites : ces contenus ne doivent
    // jamais quitter l'app vers un tiers.
    // Ne pas repasser ces deux options à false — la capture des erreurs
    // (message, pile d'appels, fil des clics) n'en dépend pas.
    Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
  ],
})
