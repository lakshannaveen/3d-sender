import React, { createContext, useCallback, useContext, useState } from 'react'

const NotifyContext = createContext(null)

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const notify = useCallback((type, message, opts = {}) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, type, message }])
    const ttl = opts.ttl ?? 4000
    if (ttl > 0) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl)
  }, [])

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  return (
    <NotifyContext.Provider value={{ notify, remove }}>
      {children}
      <div className="fixed right-4 bottom-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg max-w-xs text-sm shadow-lg border transform transition-all duration-150 ${
              t.type === 'success' ? 'bg-emerald-700/95 text-emerald-50 border-emerald-600' : 'bg-red-900/95 text-red-100 border-red-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </NotifyContext.Provider>
  )
}

export function useNotify() {
  const ctx = useContext(NotifyContext)
  if (!ctx) throw new Error('useNotify must be used within NotificationProvider')
  return ctx.notify
}

export default NotificationProvider
