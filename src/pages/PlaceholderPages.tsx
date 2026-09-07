import { useState } from 'react'
import { useToastStore } from '../stores/toastStore'

export function Settings() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const { addToast } = useToastStore()

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const res = await window.api.backup.create()
      if (res.success) {
        if (!res.data.cancelled) {
          addToast('success', 'Backup berhasil dibuat.')
        }
      } else {
        addToast('error', res.error.message || 'Backup gagal dibuat.')
      }
    } catch (e: any) {
      addToast('error', 'Terjadi kesalahan sistem saat backup.')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async () => {
    setIsRestoring(true)
    try {
      const res = await window.api.backup.restore()
      if (res.success) {
        if (!res.data.cancelled && res.data.restored) {
          addToast('success', 'Data berhasil dipulihkan. Memuat ulang...')
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        }
      } else {
        addToast('error', res.error.message || 'Restore gagal.')
      }
    } catch (e: any) {
      addToast('error', 'Terjadi kesalahan sistem saat restore.')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="flex flex-col w-full gap-8 max-w-[800px] mt-2">
      <div className="flex flex-col gap-1">
        <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Pengaturan</h1>
        <p className="text-[16px] text-on-surface-variant">Konfigurasi preferensi dan kelola data aplikasi</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[20px] font-semibold text-on-background">Backup & Restore</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined text-[24px]">save</span>
              <h3 className="text-[16px] font-semibold text-on-surface">Backup Data</h3>
            </div>
            <p className="text-[14px] text-on-surface-variant flex-1">
              Salin seluruh data FinTrack ke file cadangan. Simpan file ini di tempat yang aman.
            </p>
            <button
              onClick={handleBackup}
              disabled={isBackingUp || isRestoring}
              className="mt-2 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-[14px] transition-colors disabled:opacity-50"
            >
              {isBackingUp ? 'Memproses...' : 'Buat Backup'}
            </button>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-outline-variant/30 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[24px]">restore</span>
              <h3 className="text-[16px] font-semibold text-on-surface">Restore Data</h3>
            </div>
            <p className="text-[14px] text-on-surface-variant flex-1">
              Pulihkan data FinTrack dari file backup.
            </p>
            <div className="px-3 py-2 rounded-lg bg-error-container/50 border border-error/20 flex gap-2">
              <span className="material-symbols-outlined text-[16px] text-error mt-0.5">warning</span>
              <p className="text-[12px] text-on-error-container leading-relaxed">
                Tindakan ini akan mengganti seluruh data saat ini!
              </p>
            </div>
            <button
              onClick={handleRestore}
              disabled={isBackingUp || isRestoring}
              className="mt-2 w-full py-2.5 rounded-xl bg-error hover:bg-error/90 text-on-error font-semibold text-[14px] transition-colors disabled:opacity-50"
            >
              {isRestoring ? 'Memproses...' : 'Restore Backup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
