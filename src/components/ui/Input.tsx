import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-surface-700">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1',
            error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
              : 'border-surface-300 focus:border-primary-500 focus:ring-primary-500',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger-600">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
