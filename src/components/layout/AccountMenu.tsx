import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AccountMenu: React.FC = () => {
  const { profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [containerRef]);

  const name = profile?.full_name ?? 'Usuario';
  const initials = name
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const userItems = [
    { label: 'Inicio', to: '/app' },
    { label: 'Mis pagos', to: '/app/my-payments' },
    { label: 'Subir comprobante', to: '/app/upload-payment' },
    { label: 'Mi perfil', to: '/app/profile' },
    { label: 'Cambiar contraseña', to: '/app/change-password' },
    { label: 'Cerrar sesión', logout: true }
  ];

  const adminItems = [
    { label: 'Panel', to: '/admin' },
    { label: 'Participantes', to: '/admin/participants' },
    { label: 'Buscar', to: '/admin/search' },
    { label: 'Cambiar contraseña', to: '/app/change-password' },
    { label: 'Cerrar sesión', logout: true }
  ];

  const items = isAdmin ? adminItems : userItems;

  return (
    <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center space-x-2 rounded-full bg-gray-800 px-3 py-1 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
        <span className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm">
          {initials}
        </span>
        <span className="ml-2 block">{name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 z-50 min-w-[12rem] bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
          <div className="py-2">
            {items.map((item, index) => (
              <>
                {item.logout && index > 0 ? (
                  <div className="border-t border-gray-600 my-1" />
                ) : null}
                {item.logout ? (
                  <button
                    key={index}
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:text-red-400"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.to ?? ''}
                    onClick={() => setOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-gray-100 hover:bg-white/10"
                  >
                    {item.label}
                  </Link>
                )}
              </>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountMenu;