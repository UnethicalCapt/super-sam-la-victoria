import { Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <AppHeader />
      <main>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
