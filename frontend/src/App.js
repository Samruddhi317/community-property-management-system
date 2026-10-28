
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Payments from './pages/Payments';
import Users from './pages/Users';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole('ROLE_ADMIN')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <PrivateRoute>
              <Posts />
            </PrivateRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />

        <Route
          path="/maintenance"
          element={
            <PrivateRoute>
              <Maintenance />
            </PrivateRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <PrivateRoute>
              <Payments />
            </PrivateRoute>
          }
        />

        {/* Admin only: User Management */}
        <Route
          path="/users"
          element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          }
        />

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
