import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { School, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.PRINCIPAL:
        return 'Principal';
      case UserRole.TEACHER:
        return 'Teacher';
      case UserRole.STUDENT:
        return 'Student';
      default:
        return 'User';
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <School className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-800">School MIS</span>
            </Link>
            
            {user && user.role !== UserRole.STUDENT && (
              <div className="hidden md:flex space-x-4">
                <Link to="/" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link to="/students" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md">
                  Students
                </Link>
                <Link to="/attendance" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md">
                  Attendance
                </Link>
                {user.role === UserRole.PRINCIPAL && (
                  <Link to="/classes" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md">
                    Classes
                  </Link>
                )}
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.fullName || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-5 w-5 text-primary-600" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-700">{user.fullName || 'User'}</p>
                  <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;