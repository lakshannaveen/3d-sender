import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { io } from 'socket.io-client'
import { CheckCircle2, Clock3, Package, Send, UploadCloud, Truck } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'

function statusBadgeVariant(status) {
  if (status === 'delivered') return 'success'
  if (status === 'out_for_delivery') return 'info'
  if (status === 'cancelled') return 'warning'
  return 'default'
}

export function OrderPage() {
  const { id } = useParams()
  const { token, user } = useAuth()
  const [order, setOrder] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const bottomRef = useRef(null)

  const socket = useMemo(() => {
    if (!token) return null
    return io(import.meta.env.VITE_API_URL || 'http://localhost:8080', {
      auth: { token },
      transports: ['websocket'],
    })
  }, [token])

  async function load() {
    setError('')
    try {
      const { data } = await api.get(`/api/orders/${id}`)
      setOrder(data.order)
      setMessages(data.messages || [])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant', block: 'end' }), 0)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to load order')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!socket) return
    socket.emit('order:join', id)
    socket.on('message:new', (msg) => {
      setMessages((prev) => [...prev, msg])
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 0)
    })
    return () => {
      socket.disconnect()
    }
  }, [socket, id])

  async function sendMessage(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t || !socket) return
    setText('')
    socket.emit('message:send', { orderId: id, text: t })
  }

  async function uploadPdf(file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('pdf', file)
      const { data } = await api.post(`/api/orders/${id}/upload-pdf`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setOrder(data.order)
    } catch (e) {
      setError(e?.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function setStatus(status) {
    setStatusLoading(true)
    setError('')
    try {
      const { data } = await api.post(`/api/orders/${id}/status`, { status })
      setOrder(data.order)
    } catch (e) {
      setError(e?.response?.data?.error || 'Failed to update status')
    } finally {
      setStatusLoading(false)
    }
  }

  if (!user) return <div className="text-sm text-zinc-400">Please login to view this order.</div>
  if (!order) return <div className="text-sm text-zinc-400">{error || 'Loading…'}</div>

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4 grid gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Order</div>
                <div className="text-xs text-zinc-500 mt-1">{order._id}</div>
                <div className="text-xs text-zinc-500 mt-1">
                  Messages: <span className="text-zinc-200">{messages.length}</span>
                </div>
              </div>
              <Badge variant={statusBadgeVariant(order.status)}>{order.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {order.pdf?.path ? (
              <a
                className="text-sm text-zinc-200 hover:underline inline-flex items-center gap-2"
                href={(import.meta.env.VITE_API_URL || 'http://localhost:8080') + order.pdf.path}
                target="_blank"
                rel="noreferrer"
              >
                <UploadCloud className="h-4 w-4" />
                View uploaded PDF
              </a>
            ) : (
              <div className="text-sm text-zinc-400 inline-flex items-center gap-2">
                <Package className="h-4 w-4" />
                No PDF uploaded yet.
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
              <div className="text-sm font-medium inline-flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-sky-300" />
                Upload PDF
              </div>
              <div className="text-xs text-zinc-400 mt-2">PDF only (local save for now).</div>

              <div className="mt-3 flex flex-col gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={uploading}
                  onChange={(e) => uploadPdf(e.target.files?.[0])}
                  className="text-sm"
                />
                {uploading ? <span className="text-xs text-zinc-400">Uploading…</span> : null}
              </div>
            </div>

            {error ? <div className="mt-3 text-sm text-red-300">{String(error)}</div> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-medium">Status</div>
            <div className="text-sm text-zinc-400 mt-1">Tracking & updates</div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(user.role === 'shopOwner' || user.role === 'admin') && (
                <>
                  <Button size="sm" variant="secondary" disabled={statusLoading} onClick={() => setStatus('accepted')}>
                    Accept
                  </Button>
                  <Button size="sm" variant="secondary" disabled={statusLoading} onClick={() => setStatus('printing')}>
                    Printing
                  </Button>
                  <Button size="sm" variant="secondary" disabled={statusLoading} onClick={() => setStatus('ready')}>
                    Ready
                  </Button>
                  <Button size="sm" variant="secondary" disabled={statusLoading} onClick={() => setStatus('out_for_delivery')}>
                    Out
                  </Button>
                  <Button size="sm" disabled={statusLoading} onClick={() => setStatus('delivered')}>
                    Delivered
                  </Button>
                </>
              )}
              {user.role === 'user' && (
                <Button size="sm" variant="danger" disabled={statusLoading} onClick={() => setStatus('cancelled')}>
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-8 grid gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Chat</div>
                <div className="text-sm text-zinc-400 mt-1">Real-time messages saved in the database.</div>
              </div>
              <div className="text-xs text-zinc-500 inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Live
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[460px] overflow-auto rounded-2xl border border-zinc-900 bg-zinc-950 p-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-zinc-400">
                  No messages yet. Send the first message.
                </div>
              ) : (
                <div className="grid gap-3">
                  {messages.map((m) => {
                    const mine = String(m.senderId) === String(user.id || user._id)
                    return (
                      <div
                        key={m.id || m._id}
                        className={mine ? 'justify-self-end max-w-[80%]' : 'justify-self-start max-w-[80%]'}
                      >
                        <div
                          className={
                            mine
                              ? 'bg-white text-zinc-950 rounded-2xl px-3 py-2 text-sm'
                              : 'bg-zinc-900 text-zinc-100 rounded-2xl px-3 py-2 text-sm'
                          }
                        >
                          {m.text}
                        </div>
                        <div className="mt-1 text-[11px] text-zinc-500">
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="mt-3 flex gap-2">
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message…"
                disabled={!socket}
              />
              <Button type="submit" disabled={!socket || !text.trim()}>
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-medium inline-flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery tracking
            </div>
            <div className="text-sm text-zinc-400 mt-1">Status timeline</div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {(order.statusHistory || []).map((ev, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-xl border border-zinc-800 px-3 py-2 gap-3"
                >
                  <div className="text-sm">
                    <div className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      <span className="font-medium">{ev.status}</span>
                    </div>
                    {ev.note ? <div className="text-zinc-400 mt-1 text-sm">{ev.note}</div> : null}
                  </div>
                  <div className="text-xs text-zinc-500 whitespace-nowrap mt-1">
                    {new Date(ev.at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

