import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import heroImg from '../assets/hero.png'

export function ShopPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()

  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get(`/api/shops/${id}`)
        if (mounted) setShop(data.shop)
      } catch (e) {
        if (mounted) setError(e?.response?.data?.error || 'Failed to load shop')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  async function createOrder() {
    if (!user) return nav('/login')
    setCreating(true)
    setError('')
    try {
      const { data } = await api.post('/api/orders', {
        shopId: id,
        notes,
        firstMessage,
      })
      nav(`/orders/${data.order._id}`)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create order')
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="text-sm text-zinc-400">Loading…</div>
  if (!shop) return <div className="text-sm text-zinc-400">Shop not found.</div>

  return (
    <div className="grid gap-4">
      <Link to="/shops" className="text-sm text-zinc-400 hover:text-zinc-200">
        ← Back to shops
      </Link>

      <div className="rounded-3xl border border-zinc-800 overflow-hidden bg-zinc-950/30">
        <div className="relative h-64 sm:h-72">
          <img src={heroImg} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute left-5 bottom-5 right-5">
            <div className="text-xs text-zinc-300/80">3D Printing Shop</div>
            <div className="text-2xl sm:text-3xl font-semibold text-zinc-100 mt-1">{shop.name}</div>
            <div className="text-sm text-zinc-300 mt-2 max-w-3xl">
              {shop.description || shop.address || 'No description yet'}
            </div>
            {Array.isArray(shop.services) && shop.services.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {shop.services.map((svc, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-zinc-200 bg-zinc-950/60 border border-zinc-800 rounded-full px-2 py-1"
                  >
                    {svc}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <div className="text-lg font-semibold">Create your order</div>
              <div className="text-sm text-zinc-400 mt-1">Upload the PDF in chat after the order is created.</div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Order notes (optional)</div>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Material, size, color, deadline…"
                  />
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">First message (optional)</div>
                  <Input
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    placeholder="Hi, I want to print…"
                  />
                </div>

                {error ? <div className="text-sm text-red-300">{String(error)}</div> : null}

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={createOrder} disabled={creating}>
                    {creating ? 'Creating…' : user ? 'Create order + chat' : 'Login to create order'}
                  </Button>
                  <Button variant="secondary" onClick={() => nav('/shops')} disabled={creating}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <div className="text-lg font-semibold">Shop info</div>
              <div className="text-sm text-zinc-400 mt-1">Contact and details</div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div>
                  <div className="text-xs text-zinc-500">Address</div>
                  <div className="text-sm text-zinc-200 mt-1">{shop.address || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500">Phone</div>
                  <div className="text-sm text-zinc-200 mt-1">{shop.phone || 'Not provided'}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-4">
                  <div className="text-sm font-medium">Delivery</div>
                  <div className="text-sm text-zinc-400 mt-1">
                    Tracking will show in your order timeline as the shop updates status.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

