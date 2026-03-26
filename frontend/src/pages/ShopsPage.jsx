import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useNotify } from '../lib/notify'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import heroImg from '../assets/hero.png'

export function ShopsPage() {
  const [q, setQ] = useState('')
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/shops', { params: q.trim() ? { q } : {} })
      setShops(data.shops || [])
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to load shops'
      setError(msg)
      notify('error', String(msg))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium">3D printing shops</div>
              <div className="text-sm text-zinc-400">Search and open an order with chat.</div>
            </div>
            <div className="flex gap-2">
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, services, address..." />
              <Button onClick={load} disabled={loading}>
                {loading ? 'Loading…' : 'Search'}
              </Button>
            </div>
          </div>
          {error ? <div className="mt-3 text-sm text-red-300">{error}</div> : null}
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden animate-pulse"
                  >
                    <div className="h-28 bg-zinc-900" />
                    <div className="p-4">
                      <div className="h-4 bg-zinc-900 rounded w-2/3" />
                      <div className="h-3 bg-zinc-900 rounded w-full mt-3" />
                      <div className="h-3 bg-zinc-900 rounded w-4/5 mt-2" />
                    </div>
                  </div>
                ))
              : shops.length === 0
                ? (
                    <div className="sm:col-span-2 lg:col-span-3 text-sm text-zinc-400">
                      No shops found.
                    </div>
                  )
                : shops.map((s) => (
                    <Link
                      key={s._id}
                      to={`/shops/${s._id}`}
                      className="group rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 transition overflow-hidden"
                    >
                      <div className="relative h-28 bg-zinc-900">
                        <img src={heroImg} alt="" className="h-full w-full object-cover opacity-70 group-hover:opacity-100 transition" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-zinc-100">{s.name}</div>
                        <div className="text-sm text-zinc-400 mt-1 h-10 overflow-hidden">
                          {s.description || s.address || 'No details yet'}
                        </div>
                        {Array.isArray(s.services) && s.services.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {s.services.slice(0, 3).map((svc, idx) => (
                              <span key={idx} className="text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-800 rounded-full px-2 py-1">
                                {svc}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

