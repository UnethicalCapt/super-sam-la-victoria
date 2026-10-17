import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import Toast from '../../components/ui/Toast'
import { Link } from 'react-router-dom'
import { toUserMessage } from '../../lib/errors'

const Profile: React.FC = () => {
  const { session, profile, refreshProfile, signOut } = useAuth()
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [birthDate, setBirthDate] = useState<string>('')
  const [gender, setGender] = useState<string>('')
  const [phone, setPhone] = useState<string>('')
  const [cedula, setCedula] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [toast, setToast] = useState<{visible: boolean; message: string; type: 'success' | 'error'} | null>(null)
   
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const normalizeCedula = (value: string): string => {
    return value.replace(/[.\s-]/g, '')
  }

  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '')
      setLastName(profile.last_name ?? '')
      setBirthDate(profile.birth_date ?? '')
      setGender(profile.gender ?? '')
      setPhone(profile.phone ?? '')
      setCedula(profile.cedula ?? '')
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()

    // Basic validation
     if (!firstName.trim()) {
      showToast('El nombre es obligatorio', 'error')
      return
    }

     if (!lastName.trim()) {
      showToast('El apellido es obligatorio', 'error')
      return
    }

    const cedulaClean = normalizeCedula(cedula)
    if (!cedulaClean) {
      showToast('La cédula es obligatoria', 'error')
      return
    }

    if (cedulaClean.length < 6 || cedulaClean.length > 12) {
      showToast('La cédula debe tener entre 6 y 12 caracteres', 'error')
      return
    }

    if (!phone.trim()) {
      showToast('El teléfono es obligatorio', 'error')
      return
    }

    if (!birthDate) {
      showToast('La fecha de nacimiento es obligatoria', 'error')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`,
          birth_date: birthDate,
          gender: gender || null,
          phone: phone.trim(),
          cedula: cedulaClean,
        } as any)
        .eq('id', profile?.id as string)

      if (updateError) throw updateError

       showToast('Perfil actualizado exitosamente.', 'success')
       await refreshProfile()
     } catch (err: any) {
       showToast(toUserMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }

  const genderOptions = [
    { value: '', label: 'Seleccione género' },
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Femenino', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' },
    { value: 'Prefiero no indicar', label: 'Prefiero no indicar' },
  ]

   if (loading) {
     return (
       <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
           <div className="text-center space-y-2">
             <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
             <p className="text-sm text-gray-400">Mi perfil</p>
           </div>
           <div className="text-center text-gray-100">Guardando cambios...</div>
         </div>
       </div>
     )
   }

   if (!profile) {
     return (
       <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
         <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
           <div className="text-center space-y-2">
             <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
             <p className="text-sm text-gray-400">Mi perfil</p>
           </div>
           <div className="text-center text-gray-100">Cargando perfil...</div>
         </div>
       </div>
     )
   }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6 mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
          <p className="text-sm text-gray-400">Mi perfil</p>
        </div>

        {/* Read-only info: email and winner status */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Correo electrónico</p>
              <p className="text-xl font-semibold text-gray-100">
                {session?.user?.email || 'No disponible'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Estado en el sorteo</p>
              <p className="text-xl font-semibold text-gray-100">
                {profile.is_winner ? 'Ganador' : 'Participante regular'}
              </p>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-400">Nombre</p>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-400">Apellido</p>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-400">Cédula</p>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              maxLength={12}
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-400">Teléfono</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: 0412-1234567"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-400">Fecha de Nacimiento</p>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-400">Género</p>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {genderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
             className="w-full bg-primary text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
         </form>
          {toast ? (
            <Toast
              message={toast.message}
              type={toast.type}
              visible={toast.visible}
              onClose={() => setToast(null)}
            />
          ) : null}

          {/* Enlace secundario: cambiar contraseña */}
          <div className="mt-4">
            <Link
              to="/app/change-password"
              className="block w-full text-center text-sm text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-4 py-2"
            >
              Cambiar contraseña
            </Link>
          </div>


        {/* Link to log out */}
        <div className="mt-6">
          <button
            onClick={() => {
              signOut()
              window.location.href = '/login'
            }}
             className="w-full bg-red-500 text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-red-600 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
