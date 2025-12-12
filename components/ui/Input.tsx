// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/helpers'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, icon, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              'flex h-12 w-full rounded-xl border bg-white/5 px-4 py-3 text-sm',
              'placeholder:text-gray-400 text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
              error 
                ? 'border-red-500 focus-visible:ring-red-500' 
                : 'border-white/20 hover:border-white/30 focus:border-transparent',
              icon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          
          {icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-red-400 mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-400 mt-1">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
