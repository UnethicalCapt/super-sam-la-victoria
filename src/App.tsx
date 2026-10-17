import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import UserLayout from './components/layout/UserLayout'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import UserHome from './pages/dashboard/UserHome'
import UploadPayment from './pages/dashboard/UploadPayment'
import MyPayments from './pages/dashboard/MyPayments'
import Profile from './pages/dashboard/Profile'
import ChangePassword from './pages/dashboard/ChangePassword'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSearch from './pages/admin/AdminSearch'
import AdminUserPayments from './pages/admin/AdminUserPayments'
import AdminParticipants from './pages/admin/AdminParticipants'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import NotFound from './pages/NotFound'

function App() {
  const { session, loading, isAdmin } = useAuth()

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected user routes */}
        <Route path="/app" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route index element={<UserHome />} />
          <Route path="my-payments" element={<MyPayments />} />
          <Route path="upload-payment" element={<UploadPayment />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        {/* Protected admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="search" element={<AdminSearch />} />
          <Route path="participants" element={<AdminParticipants />} />
          <Route path="user/:userId/payments" element={<AdminUserPayments />} />
        </Route>

        {/* Redirect root path based on auth and role */}
        <Route
          path="/"
          element={
            !session
              ? <Navigate to="/login" replace />
              : isAdmin
                ? <Navigate to="/admin" replace />
                : <Navigate to="/app" replace />
          }
        />

        {/* Redirect old dashboard path to user home */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App