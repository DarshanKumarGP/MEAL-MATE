import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Address {
  id?: number;
  label: string;  // This matches your backend model
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
}

const AddressBook: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAddress, setNewAddress] = useState<Address>({
    label: 'Home',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    is_default: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/core/addresses/');
      setAddresses(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const addAddress = async () => {
    // Validation
    if (!newAddress.label.trim() || !newAddress.address_line_1.trim() || 
        !newAddress.city.trim() || !newAddress.state.trim() || 
        !newAddress.postal_code.trim()) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/core/addresses/', newAddress);
      console.log('Address created successfully:', response.data);
      
      // Reset form
      setNewAddress({
        label: 'Home',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        is_default: false
      });
      setShowForm(false);
      fetchAddresses();
      alert('Address added successfully!');
    } catch (error: any) {
      console.error('Failed to add address:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to add address: ${JSON.stringify(error.response?.data) || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h1>Your Addresses</h1>
      
      {addresses.length === 0 ? (
        <p>No addresses found.</p>
      ) : (
        addresses.map(addr => (
          <div key={addr.id} style={{ 
            border: '1px solid #ddd', 
            margin: '10px 0', 
            padding: '15px',
            borderRadius: '8px'
          }}>
            <h4>{addr.label}</h4>
            <p><strong>{addr.address_line_1}</strong></p>
            {addr.address_line_2 && <p>{addr.address_line_2}</p>}
            <p>{addr.city}, {addr.state} {addr.postal_code}</p>
            {addr.is_default && (
              <span style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Default
              </span>
            )}
          </div>
        ))
      )}

      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          style={{ 
            backgroundColor: '#007bff', 
            color: 'white', 
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add New Address
        </button>
      )}

      {showForm && (
        <div style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          margin: '20px 0',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9'
        }}>
          <h3>Add New Address</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Label *</label>
            <select
              value={newAddress.label}
              onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            >
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Address Line 1 *</label>
            <input
              type="text"
              placeholder="Street address, building, apartment"
              value={newAddress.address_line_1}
              onChange={(e) => setNewAddress({...newAddress, address_line_1: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Address Line 2</label>
            <input
              type="text"
              placeholder="Landmark (optional)"
              value={newAddress.address_line_2 || ''}
              onChange={(e) => setNewAddress({...newAddress, address_line_2: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label>City *</label>
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>State *</label>
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Postal Code *</label>
            <input
              type="text"
              placeholder="PIN Code"
              value={newAddress.postal_code}
              onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>
              <input
                type="checkbox"
                checked={newAddress.is_default || false}
                onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
              />
              {' '}Set as default address
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={addAddress}
              disabled={loading}
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Saving...' : 'Save Address'}
            </button>
            <button 
              onClick={() => setShowForm(false)}
              style={{ 
                backgroundColor: '#6c757d', 
                color: 'white', 
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;
