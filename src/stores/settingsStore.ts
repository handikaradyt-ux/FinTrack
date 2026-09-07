import { create } from 'zustand'
import type { AppSettings, ThemeSetting, CurrencySetting } from '../types/models'

interface SettingsState {
  settings: AppSettings
  loading: boolean
  initialized: boolean
  error: string | null
  
  loadSettings: () => Promise<void>
  setTheme: (theme: ThemeSetting) => Promise<void>
  setCurrency: (currency: CurrencySetting) => Promise<void>
  updateSetting: (key: string, value: string) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    theme: 'light',
    currency: 'IDR',
    language: 'id'
  },
  loading: false,
  initialized: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null })
    try {
      const result = await window.api.settings.getAll()
      if (result.error) throw new Error(result.error.message)
      
      const newSettings = result.data || {}
      
      // Defaults mapping to handle missing data
      const mergedSettings = {
        theme: newSettings.theme || 'light',
        currency: newSettings.currency || 'IDR',
        language: newSettings.language || 'id',
        ...newSettings
      }

      set({ 
        settings: mergedSettings, 
        initialized: true,
        loading: false 
      })

      // Apply theme
      if (mergedSettings.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

    } catch (error: any) {
      set({ error: error.message, loading: false, initialized: true })
    }
  },

  setTheme: async (theme) => {
    await get().updateSetting('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },

  setCurrency: async (currency) => {
    await get().updateSetting('currency', currency)
  },

  updateSetting: async (key, value) => {
    try {
      const result = await window.api.settings.update(key, value)
      if (result.error) throw new Error(result.error.message)
      
      set((state) => ({
        settings: {
          ...state.settings,
          [key]: value
        }
      }))
    } catch (error: any) {
      set({ error: error.message })
      throw error
    }
  }
}))
