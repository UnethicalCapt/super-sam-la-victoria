import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

type ProfileRow = {
  id: string
  full_name: string | null
  cedula: string | null
  phone: string | null
  role: 'user' | 'admin'
  is_winner: boolean
}

const AdminParticipants: React.FC = () => {
  const [profiles, setProfiles] = useState<ProfileRow[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileRow[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('id, full_name, cedula, phone, role, is_winner')
          .order('full_name')

        if (err) throw err
        setProfiles(data || [])
        setFilteredProfiles(data || [])
      } catch (err: any) {
        setError(err.message || 'Error al cargar los participantes')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  // Filter profiles by searchTerm (name or cedula)
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProfiles(profiles)
      return
    }

    const normalizedTerm = searchTerm.replace(/[.\s-]/g, '').toLowerCase().trim()
    const filtered = profiles.filter(profile => {
      const matchesName = profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ?? false
      const normalizedCedula = profile.cedula?.replace(/[.\s-]/g, '').toLowerCase() ?? ''
      const matchesCedula = normalizedCedula.includes(normalizedTerm)
      return matchesName || matchesCedula
    })
    setFilteredProfiles(filtered)
  }, [profiles, searchTerm])

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
       </div>
     )
   }

   return (
     <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-start py-12 px-4 sm:px-6 lg:px-8">
       <div className="w-full max-w-6xl">
         <h1 className="text-3xl font-bold text-center text-gray-100 mb-6">
           Participantes
         </h1>

         {/* Search Input */}
         <div className="mb-6">
           <input
             type="text"
             placeholder="Buscar por nombre o cédula"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
           />
         </div>

        {/* Table or Cards */}
        <div className="space-y-4">
            {filteredProfiles.length === 0 ? (
              <div className="text-center space-y-3">
                <p className="text-gray-400">
                  No se encontraron participantes.
                </p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
            <div className="grid gap-4">
              {/* For mobile, we can use cards; for desktop, a table. Let's use a responsive approach: cards on mobile, table on desktop */}
              {/* We'll use a table for simplicity and make it responsive with overflow-x-auto */}
               <div className="overflow-x-auto">
                 <table className="min-w-full divide-y divide-gray-700">
                   <thead className="bg-gray-900">
                     <tr>
<th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Nombre completo
                        </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                         Cédula
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                         Teléfono
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                         Rol
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                         Ganador
                       </th>
                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                         Acción
                       </th>
                     </tr>
                   </thead>
                   <tbody className="bg-gray-900 divide-y divide-gray-700">
                     {filteredProfiles.map((profile) => (
                       <tr key={profile.id} className="hover:bg-white/5">
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                           {profile.full_name || 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                           {profile.cedula || 'N/A'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                           {profile.phone || 'No proporcionado'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                           {profile.role === 'admin' ? 'Administrador' : 'Participante'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                           {profile.is_winner ? 'Sí' : 'No'}
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm">
                           <button
                             onClick={() => navigate(`/admin/user/${profile.id}/payments`)}
                              className="bg-primary text-white px-3 py-1 rounded-md text-xs hover:bg-primary/90 active:scale-[0.98] transition-colors duration-150"
                           >
                             Ver pagos
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminParticipants