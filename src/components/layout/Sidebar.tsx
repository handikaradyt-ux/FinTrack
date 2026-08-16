import { NavLink } from 'react-router-dom'

export function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Transaksi', path: '/transactions', icon: 'account_balance_wallet' },
    { name: 'Kategori', path: '/categories', icon: 'category' },
    { name: 'Anggaran', path: '/budgets', icon: 'savings' },
    { name: 'Laporan', path: '/reports', icon: 'analytics' },
  ]

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/30">
      <div className="h-20 flex items-center gap-sm px-lg mt-sm mb-sm">
        <img alt="FinTrack Logo" className="h-8 w-auto object-contain" src="/src/assets/fintrack_logo.png" />
        <span className="font-title-lg text-title-lg text-primary tracking-tight">FinTrack</span>
      </div>
      
      <nav className="flex-1 px-md space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-md px-lg py-3 rounded-xl transition-all font-body-md ${
                isActive
                  ? 'bg-primary text-on-primary font-title-md shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-md pb-lg pt-md">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-md px-lg py-3 rounded-xl transition-all font-body-md ${
              isActive
                ? 'bg-primary text-on-primary font-title-md shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
          Pengaturan
        </NavLink>
      </div>
    </aside>
  )
}
