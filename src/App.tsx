import { useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Categories } from './pages/Categories'
import { Budgets } from './pages/Budgets'
import { Reports } from './pages/Reports'
import { Settings } from './pages/Settings'
import { useSettingsStore } from './stores/settingsStore'

function App() {
  const { initialized, loadSettings } = useSettingsStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-on-background">
        <span className="material-symbols-outlined animate-spin text-[32px]">sync</span>
      </div>
    )
  }

  return (
    <HashRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App