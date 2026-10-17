import React, { useState } from 'react'
import { authService } from '../../services/authService'
import { paymentsService } from '../../services/paymentsService'
import { storageService } from '../../services/storageService'
import Toast from '../../components/ui/Toast'
import { toUserMessage } from '../../lib/errors'

const UploadPayment: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'binance' | 'zelle' | 'other'>('pago_movil')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null

    if (file) {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        showToast('Solo se permiten archivos JPG y PNG', 'error')
        setSelectedFile(null)
      } else if (file.size > 1024 * 1024) {
        showToast('La imagen debe pesar menos de 1 MB. Comprime la foto o elige otra.', 'error')
        setSelectedFile(null)
      } else {
        setSelectedFile(file)
      }
    } else {
      setSelectedFile(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      showToast('Por favor seleccione un archivo', 'error')
      return
    }

    setLoading(true)

    try {
      const user = await authService.getUser()
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const timestamp = new Date().getTime()
      const fileName = `${timestamp}-${selectedFile.name}`
      const filePath = `${user.id}/${fileName}`

      await storageService.uploadProof(filePath, selectedFile)

      const paymentAmount = paymentsService.getDefaultAmount()

      await paymentsService.insert({
        user_id: user.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        proof_url: filePath,
        status: 'pending',
      })

      showToast('Comprobante enviado exitosamente.', 'success')
      setSelectedFile(null)
      setPaymentMethod('pago_movil')

      setTimeout(() => {
        window.location.href = '/app/my-payments'
      }, 1000)
    } catch (err: any) {
      showToast(toUserMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
          <p className="text-sm text-gray-400">Subir Comprobante de Pago</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="paymentFile" className="block text-sm font-medium text-gray-400 mb-1">
              Comprobante de Pago (JPG o PNG, máximo 1 MB)
            </label>
            <input
              id="paymentFile"
              type="file"
              accept="image/jpeg,image/png"
              required
              onChange={handleFileChange}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400 mt-1">
              Solo JPG o PNG. Máximo 1 MB.
            </p>
            {selectedFile && (
              <p className="text-sm text-gray-400 mt-1">
                Archivo seleccionado: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>

          <div>
            <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-400 mb-1">
              Método de Pago
            </label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as 'pago_movil' | 'binance' | 'zelle' | 'other')}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="pago_movil">Pago móvil</option>
              <option value="binance">Binance</option>
              <option value="zelle">Zelle</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedFile}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Subiendo...' : 'Enviar Comprobante'}
          </button>
        </form>

        {toast && (
          <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  )
}

export default UploadPayment
