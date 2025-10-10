import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { RegisterRequest } from '../types';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<RegisterRequest>();
  const { register: registerUser, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/restaurants');
    }
  }, [user, navigate]);

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      addToast('🎉 Welcome to MEAL-MATE! Registration successful', 'success');
      navigate('/restaurants');
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.message || 
                          error?.message || 
                          'Registration failed. Please try again.';
      addToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Watch form values for dynamic UI
  const watchedFields = watch();
  const { username, email, password, first_name, last_name, user_type } = watchedFields;

  // Password strength checker
  const getPasswordStrength = (pwd: string = '') => {
    if (!pwd) return { score: 0, text: '', color: '#E5E7EB' };
    
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    const strength = [
      { text: 'Very Weak', color: '#EF4444' },
      { text: 'Weak', color: '#F97316' },
      { text: 'Fair', color: '#EAB308' },
      { text: 'Good', color: '#22C55E' },
      { text: 'Strong', color: '#16A34A' }
    ];

    return { score, ...strength[Math.min(score, 4)] };
  };

  const passwordStrength = getPasswordStrength(password);

  // User type options with descriptions
  const userTypes = [
    {
      value: 'CUSTOMER',
      icon: '🍽️',
      title: 'Customer',
      description: 'Order delicious food from restaurants',
      benefits: ['Browse restaurants', 'Track orders', 'Save favorites']
    },
    {
      value: 'RESTAURANT_OWNER',
      icon: '🏪',
      title: 'Restaurant Owner',
      description: 'Manage your restaurant and menu',
      benefits: ['List your restaurant', 'Manage orders', 'Analytics dashboard']
    },
    {
      value: 'DELIVERY_PARTNER',
      icon: '🚚',
      title: 'Delivery Partner',
      description: 'Earn by delivering orders',
      benefits: ['Flexible schedule', 'Track earnings', 'Route optimization']
    }
  ];

  const isStep1Valid = username && email && password && password.length >= 6;
  const isStep2Valid = first_name && last_name && user_type;

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
        gridTemplateColumns: window.innerWidth > 768 ? '1fr 500px' : '1fr',
        maxWidth: '1000px',
        width: '100%',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Left Side - Branding & Benefits */}
        <div style={{
          textAlign: window.innerWidth > 768 ? 'left' : 'center',
          color: 'white'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
          }}>
            🎯
          </div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            margin: '0 0 16px 0',
            textShadow: '0 4px 8px rgba(0,0,0,0.4)',
            color: '#ffffff'
          }}>
            Join MEAL-MATE
          </h1>

          <p style={{
            fontSize: '18px',
            margin: '0 0 32px 0',
            opacity: 0.95,
            lineHeight: 1.6,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            color: '#f0f0f0'
          }}>
            Become part of our growing community of food lovers, restaurant owners, and delivery partners.
          </p>

          {/* Benefits List */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '16px',
              opacity: 0.95,
              color: '#ffffff',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Why Choose MEAL-MATE?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                '🚀 Fast 30-minute delivery guarantee',
                '🏆 Top-rated restaurants & cuisines',
                '💳 Secure payment processing',
                '📱 Real-time order tracking',
                '⭐ 24/7 customer support'
              ].map((benefit, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  opacity: 0.9,
                  color: '#e0e0e0',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  <span>{benefit.split(' ')[0]}</span>
                  <span>{benefit.substring(benefit.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust Indicators */}
          <div style={{
            display: 'flex',
            gap: '32px',
            justifyContent: window.innerWidth > 768 ? 'flex-start' : 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '800',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>50K+</div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                color: '#e0e0e0',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>Happy Customers</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '800',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>500+</div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                color: '#e0e0e0',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>Restaurants</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '800',
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>4.8⭐</div>
              <div style={{ 
                fontSize: '12px', 
                opacity: 0.8,
                color: '#e0e0e0',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}>Average Rating</div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
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
              Create Account
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#4a4a4a',
              margin: 0
            }}>
              Join thousands of satisfied users
            </p>
          </div>

          {/* Step Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
            gap: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 1 ? '#FF6B35' : '#E5E7EB',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              1
            </div>
            <div style={{
              width: '40px',
              height: '2px',
              background: currentStep >= 2 ? '#FF6B35' : '#E5E7EB'
            }} />
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: currentStep >= 2 ? '#FF6B35' : '#E5E7EB',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              2
            </div>
            <div style={{
              marginLeft: '12px',
              fontSize: '12px',
              color: '#4a4a4a',
              fontWeight: '500'
            }}>
              Step {currentStep} of 2
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
            {currentStep === 1 && (
              <div>
                {/* Username Field */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d2d2d',
                    marginBottom: '8px'
                  }}>
                    Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      {...register('username', { 
                        required: 'Username is required',
                        minLength: { value: 3, message: 'Username must be at least 3 characters' },
                        pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Only letters, numbers, and underscores allowed' }
                      })}
                      placeholder="Choose a unique username"
                      style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        border: `2px solid ${errors.username ? '#EF4444' : username ? '#22C55E' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: 'white',
                        color: '#1a1a1a'
                      }}
                      onFocus={(e) => {
                        if (!errors.username) {
                          e.currentTarget.style.borderColor = '#FF6B35';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                        }
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = errors.username ? '#EF4444' : username ? '#22C55E' : '#E2E8F0';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '18px',
                      color: errors.username ? '#EF4444' : username ? '#22C55E' : '#9CA3AF'
                    }}>
                      👤
                    </span>
                  </div>
                  {errors.username && (
                    <p style={{
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '6px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>⚠️</span>
                      {errors.username.message}
                    </p>
                  )}
                </div>

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
                      placeholder="Enter your email address"
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
                <div style={{ marginBottom: '24px' }}>
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
                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                      })}
                      placeholder="Create a strong password"
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
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{ fontSize: '12px', color: '#4a4a4a' }}>Password Strength</span>
                        <span style={{ fontSize: '12px', color: passwordStrength.color, fontWeight: '600' }}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '4px',
                        background: '#E5E7EB',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          height: '100%',
                          background: passwordStrength.color,
                          transition: 'all 0.3s ease'
                        }} />
                      </div>
                    </div>
                  )}

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

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!isStep1Valid}
                  style={{
                    width: '100%',
                    background: isStep1Valid 
                      ? 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)' 
                      : '#E5E7EB',
                    color: isStep1Valid ? 'white' : '#9CA3AF',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: isStep1Valid ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Continue to Step 2 <span>→</span>
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                {/* Name Fields */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px'
                    }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      {...register('first_name', { required: 'First name is required' })}
                      placeholder="First name"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${errors.first_name ? '#EF4444' : first_name ? '#22C55E' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: 'white',
                        color: '#1a1a1a'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#2d2d2d',
                      marginBottom: '8px'
                    }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...register('last_name', { required: 'Last name is required' })}
                      placeholder="Last name"
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: `2px solid ${errors.last_name ? '#EF4444' : last_name ? '#22C55E' : '#E2E8F0'}`,
                        borderRadius: '12px',
                        fontSize: '16px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                        background: 'white',
                        color: '#1a1a1a'
                      }}
                    />
                  </div>
                </div>

                {/* User Type Selection */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d2d2d',
                    marginBottom: '12px'
                  }}>
                    I want to join as a:
                  </label>
                  <div style={{
                    display: 'grid',
                    gap: '12px'
                  }}>
                    {userTypes.map(type => (
                      <label
                        key={type.value}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '16px',
                          border: `2px solid ${user_type === type.value ? '#FF6B35' : '#E5E7EB'}`,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: user_type === type.value ? '#FFF5F0' : 'white'
                        }}
                        onMouseOver={(e) => {
                          if (user_type !== type.value) {
                            e.currentTarget.style.borderColor = '#FF6B35';
                            e.currentTarget.style.background = '#FFF5F0';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (user_type !== type.value) {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.background = 'white';
                          }
                        }}
                      >
                        <input
                          type="radio"
                          {...register('user_type', { required: 'Please select a user type' })}
                          value={type.value}
                          style={{ marginTop: '2px', accentColor: '#FF6B35' }}
                        />
                        <div style={{ fontSize: '24px' }}>{type.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1a1a1a',
                            marginBottom: '4px'
                          }}>
                            {type.title}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: '#4a4a4a',
                            marginBottom: '8px'
                          }}>
                            {type.description}
                          </div>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '4px'
                          }}>
                            {type.benefits.map((benefit, index) => (
                              <span
                                key={index}
                                style={{
                                  fontSize: '11px',
                                  background: '#F3F4F6',
                                  color: '#374151',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.user_type && (
                    <p style={{
                      fontSize: '12px',
                      color: '#EF4444',
                      margin: '6px 0 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>⚠️</span>
                      {errors.user_type.message}
                    </p>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      flex: 1,
                      background: 'white',
                      color: '#374151',
                      border: '2px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '12px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading || !isStep2Valid}
                    style={{
                      flex: 2,
                      background: (isSubmitting || isLoading || !isStep2Valid)
                        ? '#E5E7EB'
                        : 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                      color: (isSubmitting || isLoading || !isStep2Valid) ? '#9CA3AF' : 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: (isSubmitting || isLoading || !isStep2Valid) ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <span>🎉</span>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <p style={{
              fontSize: '12px',
              color: '#4a4a4a',
              textAlign: 'center',
              margin: '16px 0',
              lineHeight: 1.4
            }}>
              By creating an account, you agree to our{' '}
              <Link to="/terms" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                Privacy Policy
              </Link>
            </p>

            {/* Login Link */}
            <p style={{
              textAlign: 'center',
              fontSize: '14px',
              color: '#4a4a4a',
              margin: 0
            }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#FF6B35',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
                onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;
