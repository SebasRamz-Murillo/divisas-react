import React from 'react';

const Navbar = ({ user, onLogout }) => {
  const roleLinks = {
    ADMIN: [
      { name: 'Dashboard', href: '/dashboard' },
      { name: 'Barberos', href: '/barbers' },
      { name: 'Servicios', href: '/services' }
    ],
    BARBER: [
      { name: 'Mis Citas', href: '/appointments' },
      { name: 'Mi Horario', href: '/schedule' }
    ],
    CLIENT: [
      { name: 'Nueva Cita', href: '/new-appointment' },
      { name: 'Mis Citas', href: '/my-appointments' }
    ]
  };

  const getNavLinks = () => {
    if (!user || !user.role || !roleLinks[user.role.name]) {
      console.log('No user or role found');
      return null;
    }

    return roleLinks[user.role.name].map(link => (
      <a key={link.href} href={link.href} className="text-gray-600 hover:text-gray-900">
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