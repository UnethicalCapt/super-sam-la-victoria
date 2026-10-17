import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Link, useNavigate } from 'react-router-dom'

const Register: React.FC = () => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [cedula, setCedula] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [gender, setGender] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

  const normalizeCedula = (value: string): string => {
    return value.replace(/[.\s-]/g, '')
  }

  const validateForm = (): boolean => {
    setError(null)

    if (!firstName.trim()) {
      setError('El nombre es obligatorio')
      return false
    }

    if (!lastName.trim()) {
      setError('El apellido es obligatorio')
      return false
    }

    const cedulaClean = normalizeCedula(cedula)
    if (!cedulaClean) {
      setError('La cédula es obligatoria')
      return false
    }

    if (cedulaClean.length < 6 || cedulaClean.length > 12) {
      setError('La cédula debe tener entre 6 y 12 caracteres')
      return false
    }

    if (!phone.trim()) {
      setError('El teléfono es obligatorio')
      return false
    }

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingrese un correo electrónico válido')
      return false
    }

    if (!password) {
      setError('La contraseña es obligatoria')
      return false
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (!birthDate) {
      setError('La fecha de nacimiento es obligatoria')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const cedulaClean = normalizeCedula(cedula)
      const fullName = `${firstName.trim()} ${lastName.trim()}`

      const { data: _signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            cedula: cedulaClean,
          },
        },
      })

      if (signUpError) throw signUpError

      if (!_signUpData.session) {
        setSuccess('Revisa tu correo para confirmar la cuenta y luego inicia sesión.')
        setLoading(false)
        return
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: fullName,
          birth_date: birthDate,
          gender: gender || null,
          phone: phone.trim(),
          cedula: cedulaClean,
        } as any)
        .eq('id', signInData.user.id)

      if (updateError) throw updateError

      setSuccess('Registro exitoso. Ahora estás iniciado sesión.')
      navigate('/', { replace: true })
    } catch (err: any) {
      const rawMessage = err?.message || 'Error durante el registro'
      const msg = rawMessage.toLowerCase()

      if (
        msg.includes('already registered') ||
        msg.includes('already been registered') ||
        msg.includes('user already exists') ||
        err?.status === 422
      ) {
        setError('Este correo ya está registrado. Inicia sesión o usa otro correo.')
      } else if (msg.includes('rate limit') || msg.includes('too many requests') || err?.status === 429) {
        setError('Demasiados intentos. Espera unos minutos e intenta nuevamente.')
      } else if (msg.includes('invalid email')) {
        setError('El correo electrónico no es válido')
      } else if (msg.includes('password')) {
        setError('La contraseña no cumple los requisitos mínimos')
      } else {
        setError(rawMessage)
      }
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 space-y-6 mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-100">Super Sam La Victoria</h1>
          <p className="text-sm text-gray-200">Regístrate para una cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-1">
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-1">
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cedula" className="block text-sm font-medium text-gray-200 mb-1">
              Cédula
            </label>
            <input
              id="cedula"
              type="text"
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Ej: 12345678"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-1">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 0412-1234567"
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            </div>

            <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200 mb-1">
              Fecha de Nacimiento
            </label>
            <input
              id="birthDate"
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-200 mb-1">
              Género
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {genderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-600">{success}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>
        <p className="text-sm text-center text-gray-200">
          ¿Ya tienes una cuenta? <Link to="/login" className="text-primary hover:underline">Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
