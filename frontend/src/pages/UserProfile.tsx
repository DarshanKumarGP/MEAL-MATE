import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_joined: string;
  profile_picture?: string;
}

interface ProfileStats {
  total_orders: number;
  total_spent: string;
  favorite_cuisine: string;
  member_since: string;
}

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        api.get('/core/profile/'),
        api.get('/core/profile/stats/')
      ]);

      setProfile(profileRes.data);
      setStats(statsRes.data);
      setFormData({
        first_name: profileRes.data.first_name || '',
        last_name: profileRes.data.last_name || '',
        phone: profileRes.data.phone || '',
        email: profileRes.data.email || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      addToast('Failed to load profile data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setUpdating(true);
    try {
      const response = await api.patch('/core/profile/', formData);
      setProfile(response.data);
      setEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Failed to update profile', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      addToast('New passwords do not match', 'error');
      return;
    }

    if (passwordData.new_password.length < 8) {
      addToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setUpdating(true);
    try {
      await api.post('/core/change-password/', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      addToast('Password changed successfully!', 'success');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
    } catch (error: any) {
      addToast(error.response?.data?.detail || 'Failed to change password', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const deleteAccount = async () => {
    const confirmation = window.prompt(
      'This action cannot be undone. Type "DELETE MY ACCOUNT" to confirm:'
    );

    if (confirmation !== 'DELETE MY ACCOUNT') {
      addToast('Password changed successfully!', 'success');
      return;
    }

    try {
      await api.delete('/core/profile/');
      addToast('Account deleted successfully', 'success');
      logout();
      navigate('/');
    } catch (error) {
      addToast('Failed to delete account', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 60, height: 60, border: '4px solid #FFE8DD',
            borderTop: '4px solid #FF6B35', borderRadius: '50%',
            margin: '0 auto 20px', animation: 'spin 1s linear infinite'
          }} />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
      padding: '20px',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #FF6B35, #FF8555)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            👤 My Profile
          </h1>
          <p style={{ color: '#666', margin: 0 }}>
            Manage your account settings and preferences
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 350px' : '1fr',
          gap: '32px'
        }}>
          {/* Main Content */}
          <div>
            {/* Profile Info */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: 0,
                  color: '#333'
                }}>
                  Personal Information
                </h2>
                
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    style={{
                      background: '#FF6B35',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                marginBottom: '24px'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FF6B35, #FF8555)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)'
                }}>
                  {profile?.first_name?.charAt(0) || profile?.email?.charAt(0) || '👤'}
                </div>
                
                <div>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: '0 0 4px 0',
                    color: '#333'
                  }}>
                    {profile?.first_name} {profile?.last_name}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    margin: '0 0 8px 0'
                  }}>
                    {profile?.email}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#999',
                    margin: 0
                  }}>
                    Member since {new Date(profile?.date_joined || '').toLocaleDateString()}
                  </p>
                </div>
              </div>

              {editing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#333'
                      }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: '#333'
                      }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        background: '#F9FAFB',
                        color: '#9CA3AF'
                      }}
                    />
                    <p style={{
                      fontSize: '12px',
                      color: '#666',
                      margin: '4px 0 0 0'
                    }}>
                      Email cannot be changed
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          first_name: profile?.first_name || '',
                          last_name: profile?.last_name || '',
                          phone: profile?.phone || '',
                          email: profile?.email || ''
                        });
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateProfile}
                      disabled={updating}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        background: updating ? '#D1D5DB' : '#FF6B35',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '20px'
                }}>
                  <div>
                    <label style={{
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      First Name
                    </label>
                    <p style={{
                      fontSize: '16px',
                      color: '#333',
                      margin: '4px 0 0 0',
                      fontWeight: '500'
                    }}>
                      {profile?.first_name || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Last Name
                    </label>
                    <p style={{
                      fontSize: '16px',
                      color: '#333',
                      margin: '4px 0 0 0',
                      fontWeight: '500'
                    }}>
                      {profile?.last_name || 'Not set'}
                    </p>
                  </div>
                  
                  <div>
                    <label style={{
                      fontSize: '12px',
                      color: '#666',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Phone Number
                    </label>
                    <p style={{
                      fontSize: '16px',
                      color: '#333',
                      margin: '4px 0 0 0',
                      fontWeight: '500'
                    }}>
                      {profile?.phone || 'Not set'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 24px 0',
                color: '#333'
              }}>
                🔐 Security Settings
              </h2>

              {!showPasswordForm ? (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  style={{
                    background: '#F3F4F6',
                    border: '2px solid #E5E7EB',
                    color: '#374151',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  🔑 Change Password
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: '#333'
                    }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
                      }}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '2px solid #E2E8F0',
                        background: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={changePassword}
                      disabled={updating || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: 'none',
                        background: (updating || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) ? '#D1D5DB' : '#FF6B35',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: (updating || !passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) ? 'not-allowed' : 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {updating ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '2px solid #FEE2E2'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                margin: '0 0 16px 0',
                color: '#DC2626'
              }}>
                ⚠️ Danger Zone
              </h2>
              
              <p style={{
                color: '#666',
                margin: '0 0 20px 0',
                lineHeight: 1.6
              }}>
                Once you delete your account, there is no going back. Please be certain.
                All your orders, addresses, and data will be permanently removed.
              </p>
              
              <button
                onClick={deleteAccount}
                style={{
                  background: '#DC2626',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                🗑️ Delete Account
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Stats Card */}
            {stats && (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  margin: '0 0 20px 0',
                  color: '#333'
                }}>
                  📊 Your Stats
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#F8FAFC',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Total Orders</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#FF6B35' }}>
                      {stats.total_orders}
                    </span>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: '#F8FAFC',
                    borderRadius: '8px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>Total Spent</span>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#22C55E' }}>
                      ₹{stats.total_spent}
                    </span>
                  </div>

                  {stats.favorite_cuisine && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      background: '#F8FAFC',
                      borderRadius: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Favorite Cuisine</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                        {stats.favorite_cuisine}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: '0 0 20px 0',
                color: '#333'
              }}>
                🚀 Quick Actions
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate('/addresses')}
                  style={{
                    background: 'none',
                    border: '2px solid #E5E7EB',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  📍 Manage Addresses
                </button>

                <button
                  onClick={() => navigate('/orders')}
                  style={{
                    background: 'none',
                    border: '2px solid #E5E7EB',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  📋 Order History
                </button>

                <button
                  onClick={() => navigate('/restaurants')}
                  style={{
                    background: 'none',
                    border: '2px solid #E5E7EB',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  🏪 Browse Restaurants
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
