import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';

const Layout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex">
          {user && user.role !== UserRole.STUDENT && (
            <div className="hidden md:block w-64 mr-6">
              <Sidebar />
            </div>
          )}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;