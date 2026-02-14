import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Calendar, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Dashboard',
      path: '/',
      roles: [UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT],
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Students',
      path: '/students',
      roles: [UserRole.PRINCIPAL, UserRole.TEACHER],
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: 'Attendance',
      path: '/attendance',
      roles: [UserRole.PRINCIPAL, UserRole.TEACHER],
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Classes',
      path: '/classes',
      roles: [UserRole.PRINCIPAL],
    },
  ];

  const filteredItems = menuItems.filter(item =>
    item.roles.includes(user?.role as UserRole)
  );

  return (
    <aside className="bg-white rounded-lg shadow-md p-4">
      <nav className="space-y-2">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;