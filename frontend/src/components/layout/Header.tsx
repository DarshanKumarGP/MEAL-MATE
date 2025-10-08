import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../styles/theme';
import Button from '../ui/Button';
import api from '../../services/api';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth <= 768);
  const handleClickOutside = (event: MouseEvent) => {
    if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
      setShowUserMenu(false);
    }
  };

  window.addEventListener('resize', handleResize);
  document.addEventListener('click', handleClickOutside);

  if (user) {
    fetchCartCount();
  }

  // Add interval for polling
  let interval: NodeJS.Timeout | null = null;
  if (user) {
    interval = setInterval(() => {
      fetchCartCount();
    }, 2000); // Poll every 2 seconds
  }

  return () => {
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('click', handleClickOutside);
    if (interval) clearInterval(interval);
  };
}, [user, showUserMenu, location.pathname]);


    const fetchCartCount = async (): Promise<void> => {
  try {
    const res = await api.get('/orders/cart-items/');
    // Determine items array from different possible response shapes
    let items: Array<{ quantity?: number }> = [];

    if (Array.isArray(res.data)) {
      items = res.data;
    } else if (Array.isArray(res.data.results)) {
      items = res.data.results;
    } else if (Array.isArray(res.data.items)) {
      items = res.data.items;
    }

    // Sum quantities with correct typing
    const count = items.reduce((sum: number, item: { quantity?: number }) => {
      return sum + (item.quantity || 0);
    }, 0);

    setCartCount(count);
  } catch (error) {
    console.error('Failed to fetch cart count:', error);
    setCartCount(0);
  }
};


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
      setSearchTerm('');
    }
  };

  const navItems = [
    { 
      path: '/restaurants', 
      label: 'Restaurants', 
      icon: '🏪',
      badge: null,
      description: 'Browse food options'
    },
    { 
      path: '/orders', 
      label: 'My Orders', 
      icon: '📋',
      badge: null,
      description: 'Track your orders'
    },
    { 
      path: '/cart', 
      label: 'Cart', 
      icon: '🛒',
      badge: cartCount > 0 ? cartCount.toString() : null,
      description: 'Review your items'
    }
  ];

  const userMenuItems = [
    { 
      action: () => navigate('/profile'), 
      icon: '👤', 
      label: 'My Profile', 
      description: 'Account settings'
    },
    { 
      action: () => navigate('/addresses'), 
      icon: '📍', 
      label: 'Addresses', 
      description: 'Manage delivery locations'
    },
    { 
      action: () => navigate('/dashboard'), 
      icon: '📊', 
      label: 'Customer Dashboard', 
      description: 'Order history & stats'
    },
    { 
      action: () => navigate('/restaurant-dashboard'), 
      icon: '🏪', 
      label: 'Restaurant Panel', 
      description: 'For restaurant owners'
    }
  ];

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.colors.gray[200]}`,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: isMobile ? '60px' : '72px',
          padding: `0 ${isMobile ? theme.spacing.md : theme.spacing.lg}`
        }}>
          {/* Logo */}
          <div 
            onClick={() => navigate('/restaurants')}
            style={{
              fontSize: isMobile ? theme.typography.fontSize.xl : theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.primary.main,
              cursor: 'pointer',
              fontFamily: theme.typography.fontFamily,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.xs,
              transition: 'transform 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🍽️ MEAL-MATE
          </div>

          {/* Desktop Navigation */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
              
              {/* Navigation Items */}
              <nav style={{ display: 'flex', gap: theme.spacing.md }}>
                {navItems.map(item => (
                  <div key={item.path} style={{ position: 'relative' }}>
                    <Button
                      variant={isActive(item.path) ? 'primary' : 'ghost'}
                      onClick={() => navigate(item.path)}
                      size="sm"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.xs,
                        transition: 'all 0.2s ease',
                        transform: isActive(item.path) ? 'translateY(-1px)' : 'none',
                        boxShadow: isActive(item.path) ? '0 4px 12px rgba(255, 107, 53, 0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      {item.label}
                    </Button>
                    {item.badge && (
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        backgroundColor: theme.colors.error,
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: theme.typography.fontWeight.bold,
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite'
                      }}>
                        {item.badge}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          )}

          {/* User Menu / Mobile Menu Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
  
            {/* Desktop User Menu */}
            {!isMobile && (
              <div className="user-menu" style={{ position: 'relative' }}>
                <div
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: theme.borderRadius.lg,
                    cursor: 'pointer',
                    backgroundColor: showUserMenu ? theme.colors.primary[50] : 'transparent',
                    border: `2px solid ${showUserMenu ? theme.colors.primary.main : 'transparent'}`,
                    transition: 'all 0.2s ease',
                    minWidth: '120px'
                  }}
                  onMouseEnter={(e) => {
                    if (!showUserMenu) {
                      e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showUserMenu) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: theme.borderRadius.full,
                    background: `linear-gradient(135deg, ${theme.colors.primary.main}, ${theme.colors.primary.light})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.white,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.bold,
                    boxShadow: '0 2px 8px rgba(255, 107, 53, 0.3)'
                  }}>
                    {user.email?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.gray[700],
                      fontWeight: theme.typography.fontWeight.medium,
                      lineHeight: 1.2
                    }}>
                      {user.email?.split('@')[0] || 'User'}
                    </div>
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.gray[500]
                    }}>
                      View profile
                    </div>
                  </div>
                  <span style={{ 
                    color: theme.colors.gray[400], 
                    transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </div>

                {showUserMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: theme.spacing.sm,
                    backgroundColor: 'white',
                    borderRadius: theme.borderRadius.lg,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    border: `1px solid ${theme.colors.gray[200]}`,
                    minWidth: '280px',
                    overflow: 'hidden',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    {/* User Info Header */}
                    <div style={{
                      padding: theme.spacing.lg,
                      backgroundColor: theme.colors.primary[50],
                      borderBottom: `1px solid ${theme.colors.gray[100]}`
                    }}>
                      <div style={{ 
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.gray[800]
                      }}>
                        {user.email}
                      </div>
                      <div style={{ 
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.gray[600],
                        marginTop: theme.spacing.xs
                      }}>
                        Logged in
                      </div>
                    </div>

                    {/* Menu Items */}
                    {userMenuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => { 
                          item.action(); 
                          setShowUserMenu(false); 
                        }}
                        style={{
                          width: '100%',
                          padding: theme.spacing.md,
                          border: 'none',
                          backgroundColor: 'transparent',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.gray[700],
                          borderBottom: index < userMenuItems.length - 1 ? `1px solid ${theme.colors.gray[100]}` : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.md,
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.colors.gray[50];
                          e.currentTarget.style.paddingLeft = '20px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.paddingLeft = '16px';
                        }}
                      >
                        <span style={{ fontSize: '16px', minWidth: '20px' }}>{item.icon}</span>
                        <div>
                          <div style={{ fontWeight: theme.typography.fontWeight.medium }}>
                            {item.label}
                          </div>
                          <div style={{ 
                            fontSize: theme.typography.fontSize.xs, 
                            color: theme.colors.gray[500] 
                          }}>
                            {item.description}
                          </div>
                        </div>
                      </button>
                    ))}

                    <div style={{ 
                      height: '1px', 
                      backgroundColor: theme.colors.gray[200], 
                      margin: `${theme.spacing.sm} 0` 
                    }} />

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
                        color: theme.colors.error,
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.md,
                        fontWeight: theme.typography.fontWeight.medium,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                        e.currentTarget.style.paddingLeft = '20px';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.paddingLeft = '16px';
                      }}
                    >
                      <span style={{ fontSize: '16px', minWidth: '20px' }}>🚪</span>
                      <div>
                        <div>Sign Out</div>
                        <div style={{ 
                          fontSize: theme.typography.fontSize.xs, 
                          color: theme.colors.gray[500] 
                        }}>
                          See you later!
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: theme.spacing.sm,
                  color: theme.colors.gray[700],
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {showMobileMenu ? '✕' : '☰'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(10px)',
          zIndex: 999,
          padding: theme.spacing.lg,
          animation: 'slideDown 0.3s ease',
          overflowY: 'auto'
        }}>
          {/* Mobile Search */}
          <form onSubmit={handleSearch} style={{ marginBottom: theme.spacing.xl }}>
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: theme.spacing.md,
                border: `2px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.base,
                outline: 'none'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = theme.colors.primary.main}
              onBlur={(e) => e.currentTarget.style.borderColor = theme.colors.gray[200]}
            />
          </form>

          {/* Mobile Navigation */}
          <nav style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xl
          }}>
            {navItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setShowMobileMenu(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: theme.spacing.lg,
                  textAlign: 'left',
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: isActive(item.path) ? theme.colors.primary.main : theme.colors.gray[700],
                  backgroundColor: isActive(item.path) ? theme.colors.primary[50] : 'transparent',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                  <span style={{ fontSize: '20px' }}>{item.icon}</span>
                  <div>
                    <div>{item.label}</div>
                    <div style={{ 
                      fontSize: theme.typography.fontSize.sm, 
                      color: theme.colors.gray[500] 
                    }}>
                      {item.description}
                    </div>
                  </div>
                </div>
                {item.badge && (
                  <div style={{
                    backgroundColor: theme.colors.error,
                    color: 'white',
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.bold,
                    borderRadius: theme.borderRadius.full,
                    minWidth: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.badge}
                  </div>
                )}
              </button>
            ))}
          </nav>

          <div style={{ 
            height: '2px', 
            backgroundColor: theme.colors.gray[200], 
            margin: `${theme.spacing.xl} 0`,
            borderRadius: '1px'
          }} />

          {/* Mobile User Menu */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm
          }}>
            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.primary[50],
              borderRadius: theme.borderRadius.md,
              marginBottom: theme.spacing.md
            }}>
              <div style={{ 
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.gray[800] 
              }}>
                {user.email}
              </div>
              <div style={{ 
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.gray[600],
                marginTop: theme.spacing.xs
              }}>
                Welcome back!
              </div>
            </div>

            {userMenuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setShowMobileMenu(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: theme.spacing.lg,
                  textAlign: 'left',
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.medium,
                  color: theme.colors.gray[700],
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '20px', minWidth: '24px' }}>{item.icon}</span>
                <div>
                  <div>{item.label}</div>
                  <div style={{ 
                    fontSize: theme.typography.fontSize.sm, 
                    color: theme.colors.gray[500] 
                  }}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                padding: theme.spacing.lg,
                textAlign: 'left',
                fontSize: theme.typography.fontSize.base,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.error,
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
                marginTop: theme.spacing.md,
                backgroundColor: '#FEF2F2'
              }}
            >
              <span style={{ fontSize: '20px', minWidth: '24px' }}>🚪</span>
              <div>
                <div>Sign Out</div>
                <div style={{ 
                  fontSize: theme.typography.fontSize.sm, 
                  color: theme.colors.gray[500] 
                }}>
                  See you later!
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}
      </style>
    </>
  );
};

export default Header;
