import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { useNotify } from '../lib/notify'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'

function TopLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'text-sm px-3 py-2 rounded-xl hover:bg-zinc-900 border border-transparent',
          isActive && 'bg-zinc-900 border-zinc-800',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function Layout({ children }) {
  const { user, logout } = useAuth()
  const notify = useNotify()
  const nav = useNavigate()

  return (
    <div className="min-h-full bg-[radial-gradient(1200px_600px_at_20%_-20%,rgba(255,255,255,0.12),transparent),radial-gradient(1000px_700px_at_100%_0%,rgba(56,189,248,0.12),transparent)]">
      <header className="sticky top-0 z-10 border-b border-zinc-900 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="font-semibold tracking-tight">
            3D Sender
          </Link>
          <nav className="flex items-center gap-1">
            <TopLink to="/shops">Shops</TopLink>
            {user?.role === 'shopOwner' && <TopLink to="/owner">Owner</TopLink>}
            {user?.role === 'admin' && <TopLink to="/admin">Admin</TopLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <span className="text-xs text-zinc-400 hidden sm:block">
                  {user.name} · {user.role}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const ok = window.confirm('Are you sure you want to logout?')
                    if (!ok) return
                    logout()
                    notify('success', 'Logged out successfully')
                    nav('/')
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Create account</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
    </div>
  )
}

