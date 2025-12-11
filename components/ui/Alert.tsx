import { ReactNode } from 'react'
import { cn } from '@/utils/helpers'

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  className?: string
}

const typeStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

const typeIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}

export default function Alert({ type, title, message, className }: AlertProps) {
  return (
    <div className={cn(
      "rounded-lg border p-4",
      typeStyles[type],
      className
    )}>
      <div className="flex items-start">
        <div className="mr-3 mt-0.5">{typeIcons[type]}</div>
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  )
}
