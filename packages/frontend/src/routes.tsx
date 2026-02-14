import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import { UserRole } from './types/user.types';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudentsPage = lazy(() => import('./pages/StudentsPage'));
const AttendancePage = lazy(() => import('./pages/AttendancePage'));
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage'));
const ClassesPage = lazy(() => import('./pages/ClassesPage'));

// Protected route wrapper
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.STUDENT]}>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'students',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PRINCIPAL, UserRole.TEACHER]}>
            <Suspense fallback={<LoadingSpinner />}>
              <StudentsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'students/:id',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PRINCIPAL, UserRole.TEACHER]}>
            <Suspense fallback={<LoadingSpinner />}>
              <StudentProfilePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'attendance',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PRINCIPAL, UserRole.TEACHER]}>
            <Suspense fallback={<LoadingSpinner />}>
              <AttendancePage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'classes',
        element: (
          <ProtectedRoute allowedRoles={[UserRole.PRINCIPAL]}>
            <Suspense fallback={<LoadingSpinner />}>
              <ClassesPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;