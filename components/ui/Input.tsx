import { cn } from '@/lib/utils'
import { type InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
  // Le message d'erreur doit être relié au champ, pas seulement affiché à
  // côté : sans `aria-describedby`, un lecteur d'écran lit le champ puis
  // passe au suivant sans jamais annoncer pourquoi il est refusé.
  const errorId = id ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label htmlFor={id} className="font-body text-[13px] font-medium text-text-main dark:text-text-dark-main">{label}</label>}
      <input
        ref={ref} id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error && errorId ? errorId : undefined}
        className={cn(
          'h-11 w-full rounded-input border border-sky-border bg-sky-surface px-4 font-body text-[14px] text-text-main placeholder:text-text-tertiary transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150',
          'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15',
          'dark:border-night-border dark:bg-night-surface dark:text-text-dark-main dark:placeholder:text-text-dark-tertiary dark:focus:border-brand-dark dark:focus:ring-brand-dark/15',
          error && 'border-error focus:border-error focus:ring-error/15',
          className
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="font-body text-[12px] text-error">
          {error}
        </p>
      )}
    </div>
  )
})
Input.displayName = 'Input'
