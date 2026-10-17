import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-100 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-200 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-400 mb-6">
          La ruta que buscas no existe.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default NotFound
