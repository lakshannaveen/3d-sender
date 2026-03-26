import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  const nav = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register({ name, email, password, role })
      nav('/shops')
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Create account</div>
          <div className="text-sm text-zinc-400 mt-1">Choose user or shop owner.</div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" type="password" required />

            <div className="grid gap-2">
              <div className="text-xs text-zinc-500">Account type</div>
              <div className="flex gap-2">
                <Button type="button" variant={role === 'user' ? 'primary' : 'secondary'} onClick={() => setRole('user')}>
                  User
                </Button>
                <Button
                  type="button"
                  variant={role === 'shopOwner' ? 'primary' : 'secondary'}
                  onClick={() => setRole('shopOwner')}
                >
                  Shop owner
                </Button>
              </div>
            </div>

            {error ? <div className="text-sm text-red-300">{String(error)}</div> : null}

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create account'}
            </Button>
            <div className="text-sm text-zinc-400">
              Already have an account?{' '}
              <Link className="text-zinc-200 hover:underline" to="/login">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

