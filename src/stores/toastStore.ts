import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

interface ToastMessage {
  id: number
  type: ToastType
  message: string
}

interface ToastState {
  toasts: ToastMessage[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: number) => void
}

let nextId = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  
  addToast: (type, message) => {
    const id = ++nextId
    set((state) => ({
      toasts: [...state.toasts, { id, type, message }]
    }))
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 3000)
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))
