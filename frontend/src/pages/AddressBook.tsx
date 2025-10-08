import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Address {
  id: number;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
  address_type: 'HOME' | 'WORK' | 'OTHER';
  is_default: boolean;
}

const AddressBook: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    address_line_1: '', address_line_2: '', city: '', state: '',
    postal_code: '', landmark: '', address_type: 'HOME' as 'HOME' | 'WORK' | 'OTHER',
    is_default: false
  });

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/core/addresses/');
      setAddresses(response.data.results || []);
    } catch (error) {
      addToast('Failed to fetch addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await api.put(`/core/addresses/${editingId}/`, formData);
        addToast('Address updated successfully', 'success');
      } else {
        await api.post('/core/addresses/', formData);
        addToast('Address added successfully', 'success');
      }
      
      fetchAddresses();
      setShowForm(false);
      setEditingId(null);
      setFormData({
        address_line_1: '', address_line_2: '', city: '', state: '',
        postal_code: '', landmark: '', address_type: 'HOME', is_default: false
      });
    } catch (error) {
      addToast('Operation failed', 'error');
    }
  };

  const editAddress = (address: Address) => {
    setFormData({
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      landmark: address.landmark || '',
      address_type: address.address_type,
      is_default: address.is_default
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const deleteAddress = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/core/addresses/${id}/`);
        addToast('Address deleted successfully', 'success');
        fetchAddresses();
      } catch (error) {
        addToast('Failed to delete address', 'error');
      }
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await api.patch(`/core/addresses/${id}/`, { is_default: true });
      addToast('Default address updated', 'success');
      fetchAddresses();
    } catch (error) {
      addToast('Failed to update default address', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, border: '4px solid #FFE8DD',
            borderTop: '4px solid #FF6B35', borderRadius: '50%',
            margin: '0 auto 20px', animation: 'spin 1s linear infinite'
          }} />
          <p>Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
      padding: '20px', fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #FF6B35, #FF8555)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              📍 Address Book
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Manage your delivery addresses
            </p>
          </div>
          
          <button
            onClick={() => { setShowForm(true); setEditingId(null); }}
            style={{
              background: 'linear-gradient(135deg, #FF6B35, #FF8555)',
              color: 'white', border: 'none', padding: '12px 24px',
              borderRadius: '12px', cursor: 'pointer', fontWeight: '600',
              boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)'
            }}
          >
            + Add New Address
          </button>
        </div>

        {/* Address List */}
        {addresses.length === 0 ? (
          <div style={{
            background: 'white', borderRadius: '20px', padding: '60px',
            textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📍</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 12px 0' }}>
              No addresses found
            </h3>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Add your first delivery address to get started
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: '#FF6B35', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '8px', cursor: 'pointer'
              }}
            >
              Add Address
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {addresses.map(address => (
              <div key={address.id} style={{
                background: 'white', borderRadius: '16px', padding: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: address.is_default ? '2px solid #FF6B35' : '2px solid transparent',
                position: 'relative'
              }}>
                {address.is_default && (
                  <div style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: '#FF6B35', color: 'white', padding: '4px 12px',
                    borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                  }}>
                    DEFAULT
                  </div>
                )}
                
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0',
                      display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {address.address_type === 'HOME' && '🏠'}
                      {address.address_type === 'WORK' && '🏢'}
                      {address.address_type === 'OTHER' && '📍'}
                      {address.address_type}
                    </h3>
                    
                    <div style={{ color: '#666', lineHeight: 1.6 }}>
                      {address.address_line_1}
                      {address.address_line_2 && <><br />{address.address_line_2}</>}
                      <br />
                      {address.city}, {address.state} - {address.postal_code}
                      {address.landmark && <><br />Near: {address.landmark}</>}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => editAddress(address)}
                    style={{
                      background: '#F3F4F6', color: '#374151', border: 'none',
                      padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '14px', fontWeight: '500'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  {!address.is_default && (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      style={{
                        background: '#FEF3E2', color: '#92400E', border: 'none',
                        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                        fontSize: '14px', fontWeight: '500'
                      }}
                    >
                      ⭐ Make Default
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteAddress(address.id)}
                    style={{
                      background: '#FEF2F2', color: '#DC2626', border: 'none',
                      padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '14px', fontWeight: '500'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              background: 'white', borderRadius: '20px', padding: '32px',
              maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
            }}>
              <h3 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: '700' }}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={formData.address_line_1}
                    onChange={(e) => setFormData({...formData, address_line_1: e.target.value})}
                    required
                    style={{
                      padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                      fontSize: '14px', outline: 'none'
                    }}
                  />
                  
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.address_line_2}
                    onChange={(e) => setFormData({...formData, address_line_2: e.target.value})}
                    style={{
                      padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                      fontSize: '14px', outline: 'none'
                    }}
                  />
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <input
                      type="text"
                      placeholder="City *"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required
                      style={{
                        padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                        fontSize: '14px', outline: 'none'
                      }}
                    />
                    
                    <input
                      type="text"
                      placeholder="State *"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      required
                      style={{
                        padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                        fontSize: '14px', outline: 'none'
                      }}
                    />
                  </div>
                  
                  <input
                    type="text"
                    placeholder="PIN Code *"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                    required
                    style={{
                      padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                      fontSize: '14px', outline: 'none'
                    }}
                  />
                  
                  <input
                    type="text"
                    placeholder="Landmark (Optional)"
                    value={formData.landmark}
                    onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                    style={{
                      padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                      fontSize: '14px', outline: 'none'
                    }}
                  />
                  
                  <select
                    value={formData.address_type}
                    onChange={(e) => setFormData({...formData, address_type: e.target.value as any})}
                    style={{
                      padding: '12px', border: '2px solid #E2E8F0', borderRadius: '8px',
                      fontSize: '14px', outline: 'none'
                    }}
                  >
                    <option value="HOME">🏠 Home</option>
                    <option value="WORK">🏢 Work</option>
                    <option value="OTHER">📍 Other</option>
                  </select>
                  
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '14px', cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                      style={{ accentColor: '#FF6B35' }}
                    />
                    Set as default address
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    style={{
                      flex: 1, padding: '12px', border: '2px solid #E2E8F0',
                      background: 'white', borderRadius: '8px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1, padding: '12px', border: 'none',
                      background: '#FF6B35', color: 'white', borderRadius: '8px',
                      cursor: 'pointer', fontWeight: '600'
                    }}
                  >
                    {editingId ? 'Update' : 'Save'} Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressBook;
