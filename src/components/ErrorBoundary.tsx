import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  errorMessage: string
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <div className="bg-red-950/40 border border-red-700 text-red-200 p-6 rounded-lg max-w-md text-center">
            <h2 className="text-xl font-bold mb-2">Error inesperado</h2>
            <p className="text-sm">{this.state.errorMessage}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' })
                window.location.reload()
              }}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
