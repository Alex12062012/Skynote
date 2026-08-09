'use client'
import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { EASE, DUR, exitDur } from '@/lib/motion'
import { OtpForm } from './OtpForm'
import { createClient } from '@/lib/supabase/client'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    })

    if (error) {
      if (error.message.includes('Email rate limit exceeded')) {
        setError('Trop de tentatives. Attends quelques minutes avant de reessayer.')
      } else if (error.message.includes('Unable to validate') || error.message.includes('User not found') || error.message.includes('Signups not allowed')) {
        setError('Aucun compte avec cet email. Cree un compte d\'abord.')
      } else if (error.message.includes('SMTP') || error.message.includes('email') || error.message.includes('send')) {
        setError('Erreur d\'envoi du mail. Reessaie dans quelques instants.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    setOtpSent(true)
    setLoading(false)
  }

  // Le passage email -> code est le moment ou l'utilisateur doute le plus
  // (« est-ce que c'est parti ? »). Un remplacement sec ne dit rien ; un
  // glissement vers l'avant indique qu'on a avance d'une etape.
  // Purpose : continuite spatiale + eviter un changement brutal.
  return (
    <AnimatePresence mode="wait" initial={false}>
      {otpSent ? (
        <motion.div
          key="otp"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: DUR.base, ease: EASE.out }}
        >
          <OtpForm email={email} onBack={() => setOtpSent(false)} />
        </motion.div>
      ) : (
        <motion.form
          key="email"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24, transition: { duration: exitDur(DUR.base), ease: EASE.in } }}
          transition={{ duration: DUR.base, ease: EASE.out }}
        >
          <Input id="email" type="email" label="Email" placeholder="toi@exemple.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" error={error} />
          <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
            Recevoir le code
          </Button>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
