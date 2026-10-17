import { useState } from 'react'
import { Link } from 'react-router-dom'
import AccountMenu from './AccountMenu'

const AppHeader: React.FC = () => {
  const [logoError, setLogoError] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/app" className="inline-flex items-center gap-2 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary">
          {logoError ? (
            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium">
              Super Sam
            </div>
          ) : (
            <>
              <img
                src="/logo.png"
                alt="Super Sam"
                className="h-9 w-9 rounded-full object-cover"
                onError={() => setLogoError(true)}
              />
              <span className="hidden sm:inline text-sm font-semibold text-white">Super Sam</span>
            </>
          )}
        </Link>
        <div className="flex items-center">
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}

export default AppHeader
