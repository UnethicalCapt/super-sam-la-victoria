import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import { useSignedUrls } from '../../hooks/useSignedUrls'
import { toUserMessage } from '../../lib/errors'

const MyPayments: React.FC = () => {
  const [payments, setPayments] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { urls } = useSignedUrls(payments)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments(data || [])
    } catch (err: any) {
      setError(toUserMessage(err))
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

   if (loading) {
     return (
       <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
         <div className="text-center text-gray-100">Cargando...</div>
       </div>
     )
   }

   if (error) {
     return (
       <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-950/40 border border-red-700 text-red-200 p-4 w-full max-w-xl">
            <p className="font-bold">{error}</p>
         </div>

         {/* Actions */}
         <div className="mt-6 space-y-3">
           <Link
             to="/app/upload-payment"
             className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
           >
             Subir comprobante de pago
           </Link>
           <Link
             to="/app/my-payments"
             className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
           >
             Ver mis pagos
           </Link>
           <Link
             to="/app/profile"
             className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
           >
             Mi perfil
           </Link>
         </div>
       </div>
     )
   }

    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
            <p className="text-sm text-gray-200">Mis Pagos</p>
          </div>
          
           {payments.length === 0 ? (
             <div className="text-center space-y-4">
               <p className="text-gray-200">
                 Aún no has enviado ningún comprobante de pago.
               </p>
               <Link
                 to="/app/upload-payment"
                 className="w-inline-flex bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 font-medium"
               >
                 Subir comprobante
               </Link>
             </div>
           ) : (
            <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-100">Fecha de pago</div>
                      <div className="text-sm text-gray-200">
                        {new Date(payment.created_at).toLocaleDateString()} 
                        {new Date(payment.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-100">Método de pago</div>
                      <div className="text-gray-100">
                        {payment.payment_method === 'pago_movil' ? 'Pago Móvil' :
                         payment.payment_method === 'binance' ? 'Binance USDT' :
                         payment.payment_method === 'zelle' ? 'Zelle' : 'Otro'}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-100">Monto</div>
                      <div className="font-bold text-gray-100">${Number(payment.amount).toFixed(2)}</div>
                    </div>
                    
                    <div className="flex justify-between items-start">
                      <div className="font-medium text-gray-100">Estado</div>
                      <div className={`px-2 py-1 rounded text-sm font-medium ${payment.status === 'pending' ? 'bg-yellow-900 text-yellow-100' : payment.status === 'approved' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'}`}>
                        {payment.status === 'pending' ? 'Pendiente' :
                         payment.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                      </div>
                    </div>
                    {payment.status === 'rejected' && payment.notes && (
                      <div className="flex justify-between items-start mt-1">
                        <div className="font-medium text-gray-400 text-sm">Motivo</div>
                        <div className="text-sm text-red-200">{payment.notes}</div>
                      </div>
                    )}
                    
                    {/* Comprobante */}
                    <div className="flex justify-between items-start mt-2">
                      <div className="font-medium text-gray-100">Comprobante</div>
                      <div>
                        {payment.proof_url ? (
                          urls[payment.id] ? (
                            <>
                              <a href={urls[payment.id]} target="_blank" rel="noopener noreferrer">
                                <img src={urls[payment.id]} alt="Comprobante" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', borderRadius: '4px' }} />
                              </a>
                            </>
                          ) : (
                            <span className="text-red-500">Comprobante no disponible</span>
                          )
                        ) : (
                          <span className="text-gray-200">Sin comprobante</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>
    )
}

export default MyPayments