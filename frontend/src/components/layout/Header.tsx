import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';
import Button from '../ui/Button';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: '/restaurants', label: 'Restaurants', icon: '🍽️' },
    { path: '/orders', label: 'My Orders', icon: '📋' },
    { path: '/cart', label: 'Cart', icon: '🛒' },
  ];

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <header style={{
      backgroundColor: theme.colors.white,
      borderBottom: `1px solid ${theme.colors.gray[200]}`,
      padding: `0 ${theme.spacing.lg}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: theme.shadows.sm
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '72px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => navigate('/restaurants')}
          style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.primary.main,
            cursor: 'pointer',
            fontFamily: theme.typography.fontFamily
          }}
        >
          🍽️ MEAL-MATE
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', gap: theme.spacing.md }}>
          {navItems.map(item => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'primary' : 'ghost'}
              onClick={() => navigate(item.path)}
              icon={<span>{item.icon}</span>}
              size="sm"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              backgroundColor: showUserMenu ? theme.colors.gray[50] : 'transparent'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: theme.borderRadius.full,
              backgroundColor: theme.colors.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.white,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.gray[700],
              fontWeight: theme.typography.fontWeight.medium
            }}>
              {user.username}
            </span>
            <span style={{ color: theme.colors.gray[400] }}>▼</span>
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: theme.spacing.sm,
              backgroundColor: theme.colors.white,
              borderRadius: theme.borderRadius.md,
              boxShadow: theme.shadows.lg,
              border: `1px solid ${theme.colors.gray[200]}`,
              minWidth: '200px',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => { navigate('/addresses'); setShowUserMenu(false); }}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.gray[700],
                  borderBottom: `1px solid ${theme.colors.gray[100]}`
                }}
              >
                📍 Manage Addresses
              </button>
              <button
                onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.gray[700],
                  borderBottom: `1px solid ${theme.colors.gray[100]}`
                }}
              >
                ⚙️ Dashboard
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: 'none',
                  backgroundColor: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.error
                }}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
