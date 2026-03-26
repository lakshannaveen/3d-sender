import { cn } from '../../lib/utils'

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-zinc-300/20 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-white text-zinc-950 hover:bg-zinc-200',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
    ghost: 'bg-transparent hover:bg-zinc-900 border border-zinc-800',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }
  return (
    <button
      className={cn(base, variants[variant] || variants.primary, sizes[size] || sizes.md, className)}
      {...props}
    />
  )
}

