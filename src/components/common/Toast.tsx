import { useToastStore } from '../../stores/toastStore'

export function Toast() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => {
        const isError = toast.type === 'error'
        const isSuccess = toast.type === 'success'

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border animate-in slide-in-from-right-4 fade-in duration-300 ${
              isError
                ? 'bg-error-container text-on-error-container border-error/20'
                : isSuccess
                ? 'bg-primary-container text-on-primary-container border-primary/20'
                : 'bg-surface-container-high text-on-surface border-outline-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isError ? 'error' : isSuccess ? 'check_circle' : 'info'}
            </span>
            <p className="text-[14px] font-medium pr-4">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-auto flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
