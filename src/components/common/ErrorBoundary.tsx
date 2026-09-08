import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.error('Uncaught error:', error, errorInfo)
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-on-background p-6">
          <div className="w-16 h-16 bg-error-container text-on-error-container rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px]">warning</span>
          </div>
          <h1 className="text-[24px] font-bold text-on-surface mb-2">Terjadi Kesalahan</h1>
          <p className="text-[15px] text-on-surface-variant max-w-md text-center mb-8 leading-relaxed">
            Aplikasi mengalami masalah saat menampilkan halaman ini. Cobalah untuk memuat ulang halaman.
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            Coba Muat Ulang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
