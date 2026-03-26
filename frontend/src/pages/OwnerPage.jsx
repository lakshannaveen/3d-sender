import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

function badgeVariant(status) {
  if (status === 'delivered') return 'success'
  if (status === 'out_for_delivery') return 'info'
  if (status === 'cancelled') return 'warning'
  return 'default'
}

export function OwnerPage() {
  const [orders, setOrders] = useState([])
  const [shopName, setShopName] = useState('')
  const [shopDescription, setShopDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [error, setError] = useState('')

  async function loadOrders() {
    setLoadingOrders(true)
    setError('')
    try {
      const { data } = await api.get('/api/orders/mine')
      setOrders(data.orders || [])
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load orders')
    } finally {
      setLoadingOrders(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  async function createShop(e) {
    e.preventDefault()
    setCreating(true)
    setError('')
    try {
      await api.post('/api/shops', {
        name: shopName,
        description: shopDescription,
        services: ['3D printing'],
      })
      setShopName('')
      setShopDescription('')
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to create shop')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Owner dashboard</div>
          <div className="text-sm text-zinc-400 mt-1">Create your shop and manage incoming orders.</div>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={createShop}>
            <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Shop name" required />
            <Input value={shopDescription} onChange={(e) => setShopDescription(e.target.value)} placeholder="Short description" />
            {error ? <div className="text-sm text-red-300">{String(error)}</div> : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create shop'}
              </Button>
              <Button type="button" variant="secondary" disabled={loadingOrders} onClick={loadOrders}>
                {loadingOrders ? 'Loading…' : 'Refresh orders'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Orders</div>
          <div className="text-sm text-zinc-400 mt-1">Click an order to open chat, PDF, and delivery status.</div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {orders.length === 0 ? (
              <div className="text-sm text-zinc-400">No orders yet.</div>
            ) : (
              orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/orders/${o._id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 px-4 py-3 transition"
                >
                  <div>
                    <div className="text-sm font-medium">Order</div>
                    <div className="text-xs text-zinc-500">{o._id}</div>
                  </div>
                  <Badge variant={badgeVariant(o.status)}>{o.status}</Badge>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

