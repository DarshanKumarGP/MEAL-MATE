import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LoginRequest } from '../types';
import { useNavigate, Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<LoginRequest>();
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/restaurants');
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      await login(data);
      addToast('Welcome back! Login successful', 'success');
      navigate('/restaurants');
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Login failed. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Watch form values for dynamic UI
  const email = watch('email');
  const password = watch('password');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #e94560 75%, #FF6B35 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Background overlay for better contrast */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.3)',
        zIndex: 1
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 400px' : '1fr',
        maxWidth: '900px',
        width: '100%',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Left Side - Branding & Info */}
        <div style={{
          textAlign: window.innerWidth > 768 ? 'left' : 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
          }}>
            🍽️
          </div>
          
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            margin: '0 0 16px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.4)',
            color: '#ffffff'
          }}>
            MEAL-MATE
          </h1>
          
          <p style={{
            fontSize: '18px',
            margin: '0 0 32px 0',
            opacity: 0.95,
            lineHeight: 1.6,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            color: '#f0f0f0'
          }}>
            Your favorite meals delivered fresh from the best restaurants in town. 
            Fast, reliable, and delicious.
          </p>

          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              opacity: 0.9,
              color: '#e0e0e0',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              <span>⚡</span>
              <span>30 min delivery</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              opacity: 0.9,
              color: '#e0e0e0',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              <span>🏪</span>
              <span>500+ restaurants</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              opacity: 0.9,
              color: '#e0e0e0',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}>
              <span>⭐</span>
              <span>4.8 rating</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: '0 0 8px 0'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#4a4a4a',
              margin: 0
            }}>
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            {/* Email Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    border: `2px solid ${errors.email ? '#EF4444' : email ? '#22C55E' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'white',
                    color: '#1a1a1a'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.email ? '#EF4444' : email ? '#22C55E' : '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: errors.email ? '#EF4444' : email ? '#22C55E' : '#9CA3AF'
                }}>
                  📧
                </span>
                {email && !errors.email && (
                  <span style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '16px',
                    color: '#22C55E'
                  }}>
                    ✓
                  </span>
                )}
              </div>
              {errors.email && (
                <p style={{
                  fontSize: '12px',
                  color: '#EF4444',
                  margin: '6px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>⚠️</span>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2d2d2d',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    padding: '14px 52px 14px 48px',
                    border: `2px solid ${errors.password ? '#EF4444' : password ? '#22C55E' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                    background: 'white',
                    color: '#1a1a1a'
                  }}
                  onFocus={(e) => {
                    if (!errors.password) {
                      e.currentTarget.style.borderColor = '#FF6B35';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.password ? '#EF4444' : password ? '#22C55E' : '#E2E8F0';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: errors.password ? '#EF4444' : password ? '#22C55E' : '#9CA3AF'
                }}>
                  🔒
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    color: '#6B7280',
                    padding: '4px'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p style={{
                  fontSize: '12px',
                  color: '#EF4444',
                  margin: '6px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span>⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              style={{
                width: '100%',
                background: (isSubmitting || isLoading) 
                  ? 'linear-gradient(135deg, #ccc 0%, #999 100%)' 
                  : 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: (isSubmitting || isLoading) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginBottom: '24px'
              }}
              onMouseOver={(e) => {
                if (!isSubmitting && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isSubmitting && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 53, 0.3)';
                }
              }}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Sign In
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#4a4a4a',
              margin: 0
            }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{
                  color: '#FF6B35',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Sign up free
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Spinning animation for loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;
