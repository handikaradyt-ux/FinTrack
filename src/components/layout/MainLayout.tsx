import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toast } from '../common/Toast'

export function MainLayout() {
  return (
    <div className="bg-background font-body-md text-on-surface">
      <Sidebar />
      <div className="pl-[260px]">
        <Header />
        <main className="relative pt-24 min-h-screen bg-background px-10 pb-10">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
