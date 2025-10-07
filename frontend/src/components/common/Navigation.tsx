import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/restaurants', label: 'Restaurants', icon: '🍽️' },
    { path: '/cart', label: 'Cart', icon: '🛒' },
    { path: '/orders', label: 'Orders', icon: '📋' },
    { path: '/addresses', label: 'Addresses', icon: '📍' },
  ];

  if (!user) return null;

  return (
    <nav style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        <div 
          onClick={() => navigate('/restaurants')}
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#ff6b35',
            cursor: 'pointer'
          }}
        >
          MEAL-MATE
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: location.pathname === item.path ? '#ff6b35' : '#666',
                backgroundColor: location.pathname === item.path ? '#fff5f0' : 'transparent'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Hello, {user.username}
          </span>
          <button
            onClick={() => { logout(); navigate('/'); }}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              color: '#666'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;