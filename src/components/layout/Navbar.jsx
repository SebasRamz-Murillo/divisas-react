import React from 'react';

const Navbar = ({ user, onLogout }) => {
  const roleLinks = {
    "2": [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Barberos', href: '/barbers' },
      { name: 'Servicios', href: '/services' }
    ],
    "3": [
      { name: 'Mis Citas', href: '/appointments' },
      { name: 'Mi Horario', href: '/schedule' }
    ],
    "4": [
      { name: 'Nueva Cita', href: '/new-appointment' },
      { name: 'Mis Citas', href: '/my-appointments' }
    ]
  };

  const getNavLinks = () => {
    const role = localStorage.getItem('barber_role');
    if (!role) return null;

    return roleLinks[role].map((link, index) => (
      <a
        key={index}
        href={link.href}
        className="text-gray-600 hover:text-gray-900"
      >
        {link.name}
      </a>
    ));
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8 items-center">
            <a href="/" className="text-xl font-bold text-blue-600">
              BarberApp
            </a>
            {getNavLinks()}
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={onLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;