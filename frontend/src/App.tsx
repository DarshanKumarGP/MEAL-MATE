// src/App.tsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import Header from './components/layout/Header';
import Toaster from './components/ui/Toaster';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/cart';
import Checkout from './pages/Checkout';
import AddressBook from './pages/AddressBook';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Dashboard from './pages/Dashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import UserProfile from './pages/UserProfile';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#FF6B35' },
    secondary: { main: '#2C3E50' },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Router>
      {/* Show header only when authenticated */}
      {user && <Header />}

      <Routes>
        {/* Root: redirect based on auth */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/restaurants" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/restaurants"
          element={
            <ProtectedRoute>
              <RestaurantList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurants/:id"
          element={
            <ProtectedRoute>
              <RestaurantDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addresses"
          element={
            <ProtectedRoute>
              <AddressBook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-dashboard"
          element={
            <ProtectedRoute>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        {/* Catch-all: redirect to login if unauthenticated */}
        <Route
          path="*"
          element={<Navigate to={user ? "/restaurants" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ToastProvider>
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { box-sizing: border-box; }
              body {
                margin: 0;
                padding: 0;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background-color: #F9FAFB;
              }
            `}
          </style>
          <AuthProvider>
            <NotificationProvider>
              <Toaster />
              <AppRoutes />
            </NotificationProvider>
          </AuthProvider>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
