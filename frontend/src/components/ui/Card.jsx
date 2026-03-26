import { cn } from '../../lib/utils'

export function Card({ className, ...props }) {
  return <div className={cn('rounded-2xl border border-zinc-800 bg-zinc-950/60', className)} {...props} />
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 border-b border-zinc-800', className)} {...props} />
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5', className)} {...props} />
}

