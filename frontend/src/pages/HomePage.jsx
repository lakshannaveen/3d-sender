import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import heroImg from '../assets/hero.png'
import { Box, MessageCircle, Truck } from 'lucide-react'

export function HomePage() {
  return (
    <div className="grid gap-6">
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/60">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(900px_500px_at_10%_0%,rgba(255,255,255,0.18),transparent)]" />
        <div className="absolute -right-28 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-2xl" />
        <div className="absolute -left-28 -bottom-24 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-2xl" />

        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/50 px-4 py-2 text-sm text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Real-time chat + delivery timeline
              </div>
              <h1 className="mt-5 text-3xl sm:text-5xl font-semibold tracking-tight">
                Send your 3D print file. Chat live. Get it delivered.
              </h1>
              <p className="mt-4 text-zinc-300 max-w-xl">
                Find 3D printing shops, upload a PDF (for now), and coordinate everything inside one order with instant chat.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/shops">
                  <Button size="lg">Find shops</Button>
                </Link>
                <Link to="/register">
                  <Button size="lg" variant="secondary">
                    Create account
                  </Button>
                </Link>
              </div>

              <div className="mt-8 grid sm:grid-cols-3 gap-3">
                <Card className="bg-zinc-950/40">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Box className="h-4 w-4 text-sky-300" />
                      Search
                    </div>
                    <div className="text-sm text-zinc-400 mt-2">Browse shops and open an order.</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-950/40">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <MessageCircle className="h-4 w-4 text-fuchsia-300" />
                      Real-time chat
                    </div>
                    <div className="text-sm text-zinc-400 mt-2">Chat inside the order to clarify details.</div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-950/40">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Truck className="h-4 w-4 text-emerald-300" />
                      Tracking
                    </div>
                    <div className="text-sm text-zinc-400 mt-2">Status timeline from requested to delivered.</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-sky-500/20 via-fuchsia-500/10 to-transparent blur-xl" />
              <div className="relative rounded-3xl border border-zinc-800 bg-zinc-950/40 p-4 overflow-hidden">
                <img src={heroImg} alt="3D printing preview" className="w-full h-72 object-cover rounded-2xl" />
                <div className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Upload
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                    Chat
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Deliver
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-zinc-500">
                Tip: shop covers will be added next (right now we use the default preview image).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

