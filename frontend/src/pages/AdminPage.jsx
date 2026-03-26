import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useNotify } from '../lib/notify'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

function badgeVariant(status) {
  if (status === 'delivered') return 'success'
  if (status === 'out_for_delivery') return 'info'
  if (status === 'cancelled') return 'warning'
  return 'default'
}

export function AdminPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const notify = useNotify()

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/orders/mine')
      setOrders(data.orders || [])
    } catch (e) {
      const msg = e?.response?.data?.error || 'Failed to load orders'
      setError(msg)
      notify('error', String(msg))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold">Admin</div>
          <div className="text-sm text-zinc-400 mt-1">View all orders (basic admin view).</div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={load} disabled={loading}>
              {loading ? 'Loading…' : 'Refresh'}
            </Button>
            {error ? <div className="text-sm text-red-300">{String(error)}</div> : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium">Orders</div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {orders.length === 0 ? (
              <div className="text-sm text-zinc-400">No orders.</div>
            ) : (
              orders.map((o) => (
                <Link
                  key={o._id}
                  to={`/orders/${o._id}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 px-4 py-3 transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">Order {o._id}</div>
                    <div className="text-xs text-zinc-500 truncate">
                      user: {o.userId} · shop: {o.shopId}
                    </div>
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

