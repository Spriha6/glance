import { useEffect } from 'react'

export interface ToastMessage {
  id: number
  text: string
  undo?: () => void
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

const TOAST_MS = 6000

/** Gmail-style snackbar with an optional Undo. */
export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDismiss, TOAST_MS)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          {toast.undo && (
            <button
              type="button"
              className="toast__undo"
              onClick={() => {
                toast.undo?.()
                onDismiss()
              }}
            >
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  )
}
