import { useState, useEffect } from 'react'
import { useSettingsStore } from '../stores/settingsStore'
import { useToastStore } from '../stores/toastStore'

export function Settings() {
  const { settings, setTheme, setCurrency } = useSettingsStore()
  const { addToast } = useToastStore()
  
  const [version, setVersion] = useState<string>('Memuat...')
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    window.api.getVersion().then(setVersion).catch(() => setVersion('Tidak diketahui'))
  }, [])

  const handleBackup = async () => {
    setIsBackingUp(true)
    try {
      const result = await window.api.backup.create()
      if (result.error) throw new Error(result.error.message)
      if (!result.data?.cancelled) {
        addToast('success', `Backup berhasil disimpan di:\n${result.data?.filePath}`)
      }
    } catch (err: any) {
      addToast('error', err.message || 'Gagal membuat backup')
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleRestore = async () => {
    setIsRestoring(true)
    try {
      const result = await window.api.backup.restore()
      if (result.error) throw new Error(result.error.message)
      if (result.data?.restored) {
        addToast('success', 'Database berhasil dipulihkan. Memuat ulang...')
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (err: any) {
      addToast('error', err.message || 'Gagal memulihkan database')
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="flex flex-col w-full max-w-3xl gap-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Pengaturan</h1>
        <p className="text-[16px] text-on-surface-variant">Kelola preferensi dan sistem aplikasi Anda</p>
      </div>

      {/* Preferensi */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Preferensi</h2>
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col overflow-hidden">
          
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-on-surface">Format Mata Uang</span>
              <span className="text-[13px] text-on-surface-variant">Ubah format mata uang yang ditampilkan pada aplikasi</span>
            </div>
            <select
              value={settings.currency || 'IDR'}
              onChange={(e) => setCurrency(e.target.value as 'IDR' | 'USD')}
              className="px-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="IDR">Rupiah (IDR)</option>
              <option value="USD">US Dollar (USD)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-on-surface">Tema Tampilan</span>
              <span className="text-[13px] text-on-surface-variant">Pilih tema terang atau gelap</span>
            </div>
            <select
              value={settings.theme || 'light'}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
              className="px-4 py-2 bg-surface-container-low border border-outline-variant/50 rounded-lg text-[14px] font-medium text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="light">Terang (Light)</option>
              <option value="dark">Gelap (Dark)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-5 bg-surface-container-lowest/50 opacity-60">
            <div className="flex flex-col gap-1">
              <span className="text-[15px] font-semibold text-on-surface">Bahasa Sistem</span>
              <span className="text-[13px] text-on-surface-variant">Bahasa tampilan aplikasi</span>
            </div>
            <span className="px-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-lg text-[14px] font-medium text-on-surface-variant cursor-not-allowed">
              Bahasa Indonesia
            </span>
          </div>

        </div>
      </div>

      {/* Backup & Restore */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Pencadangan Data</h2>
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col overflow-hidden">
          
          <div className="flex items-center justify-between p-5 border-b border-outline-variant/20">
            <div className="flex flex-col gap-1 w-2/3">
              <span className="text-[15px] font-semibold text-on-surface">Buat Cadangan (Backup)</span>
              <span className="text-[13px] text-on-surface-variant leading-relaxed">Simpan salinan seluruh data keuangan Anda ke dalam file aman di komputer Anda.</span>
            </div>
            <button
              onClick={handleBackup}
              disabled={isBackingUp || isRestoring}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-lg text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              {isBackingUp ? 'Memproses...' : 'Backup Data'}
            </button>
          </div>

          <div className="flex items-center justify-between p-5">
            <div className="flex flex-col gap-1 w-2/3">
              <span className="text-[15px] font-semibold text-on-surface">Pulihkan Data (Restore)</span>
              <span className="text-[13px] text-on-surface-variant leading-relaxed">Ganti data saat ini dengan data dari file cadangan. <strong className="text-error font-semibold">Tindakan ini akan menimpa data aktif Anda.</strong></span>
            </div>
            <button
              onClick={handleRestore}
              disabled={isBackingUp || isRestoring}
              className="flex items-center gap-2 px-4 py-2.5 bg-error-container text-on-error-container rounded-lg text-[14px] font-semibold hover:bg-error-container/80 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">restore</span>
              {isRestoring ? 'Memulihkan...' : 'Restore Data'}
            </button>
          </div>

        </div>
      </div>

      {/* Tentang Aplikasi */}
      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-bold text-on-surface uppercase tracking-wider">Tentang Aplikasi</h2>
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col items-center justify-center gap-2 text-center">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-2xl flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[32px]">account_balance_wallet</span>
          </div>
          <h3 className="text-[20px] font-bold text-on-surface">FinTrack</h3>
          <p className="text-[14px] font-medium text-on-surface-variant">Versi {version}</p>
          <div className="mt-4 text-[13px] text-on-surface-variant flex flex-col gap-1">
            <p>Aplikasi Manajemen Keuangan Pribadi</p>
            <p className="opacity-70">Dibangun menggunakan Electron, React, & Tailwind CSS</p>
          </div>
        </div>
      </div>
      
    </div>
  )
}
