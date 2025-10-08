import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CartItemData {
  id: number;
  menu_item: {
    id: number;
    name: string;
    description?: string;
    category?: {
      id: number;
      name: string;
    };
    restaurant: {
      id: number;
      name: string;
      delivery_fee: number;
      cuisine_type?: string;
    };
    price: string;
    image?: string;
    is_vegetarian?: boolean;
    is_spicy?: boolean;
  };
  quantity: number;
  unit_price: string;
  subtotal?: string;
  special_instructions?: string;
}

const Cart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showPromo, setShowPromo] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/orders/cart-items/');
      setCartItems(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      addToast('Failed to load cart items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    setUpdating(itemId);
    try {
      await api.patch(`/orders/cart-items/${itemId}/`, {
        quantity: newQuantity
      });
      await fetchCartItems();
      addToast('Cart updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update quantity:', error);
      addToast('Failed to update cart', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      await api.delete(`/orders/cart-items/${itemId}/`);
      await fetchCartItems();
      addToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Failed to remove item:', error);
      addToast('Failed to remove item', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase().trim();
    if (code === 'SAVE10') {
      setDiscount(10);
      addToast('10% discount applied!', 'success');
    } else if (code === 'FIRST20') {
      setDiscount(20);
      addToast('20% discount applied!', 'success');
    } else if (code === 'WELCOME15') {
      setDiscount(15);
      addToast('15% welcome discount applied!', 'success');
    } else {
      addToast('Invalid promo code', 'error');
      setDiscount(0);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => 
      total + (parseFloat(item.unit_price) * item.quantity), 0
    );
    
    const deliveryFee = cartItems.length > 0 ? 
      (cartItems[0]?.menu_item?.restaurant?.delivery_fee || 40) : 0;
    
    const discountAmount = (subtotal * discount) / 100;
    const taxes = subtotal * 0.05;
    const total = subtotal + deliveryFee + taxes - discountAmount;

    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      discount: discountAmount.toFixed(2),
      taxes: taxes.toFixed(2),
      total: total.toFixed(2)
    };
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 60, 
            height: 60, 
            border: '4px solid #FFE8DD',
            borderTop: '4px solid #FF6B35',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#666', fontSize: 16 }}>Loading your delicious cart...</p>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(255, 107, 53, 0.1)',
          border: '1px solid rgba(255, 107, 53, 0.08)'
        }}>
          <div style={{ 
            fontSize: '100px', 
            marginBottom: '24px',
            background: 'linear-gradient(135deg, #FF6B35, #FF8555)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 8px rgba(255, 107, 53, 0.3))'
          }}>
            🍽️
          </div>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #333 0%, #666 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 16px 0'
          }}>
            Your cart is empty
          </h2>
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: '0 0 40px 0',
            lineHeight: 1.6
          }}>
            Looks like you haven't added anything to your cart yet. 
            Start exploring delicious food from your favorite restaurants!
          </p>
          <button
            onClick={() => navigate('/restaurants')}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.3)';
            }}
          >
            <span>🏪</span>
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const restaurant = cartItems[0]?.menu_item?.restaurant;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth > 768 ? '1fr 420px' : '1fr',
          gap: '24px'
        }}>
          {/* Cart Items Section */}
          <div>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h1 style={{
                  fontSize: '36px',
                  fontWeight: '800',
                  margin: '0 0 8px 0',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Your Cart
                </h1>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  margin: 0
                }}>
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} • Ready to checkout
                </p>
              </div>
              <button
                onClick={() => navigate('/restaurants')}
                style={{
                  background: 'white',
                  color: '#FF6B35',
                  border: '2px solid #FF6B35',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(255, 107, 53, 0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#FF6B35';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#FF6B35';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>➕</span>
                Add More Items
              </button>
            </div>

            {/* Restaurant Card */}
            {restaurant && (
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(255, 107, 53, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)'
                }}>
                  🏪
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#333',
                    margin: '0 0 8px 0'
                  }}>
                    {restaurant.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {restaurant.cuisine_type && (
                      <span style={{
                        background: '#F0F8FF',
                        color: '#2563EB',
                        padding: '4px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {restaurant.cuisine_type}
                      </span>
                    )}
                    <span style={{
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      🚚 Delivery: ₹{restaurant.delivery_fee || 40}
                    </span>
                    <span style={{
                      color: '#666',
                      fontSize: '14px'
                    }}>
                      ⏰ 25-35 mins
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map(item => (
                <div 
                  key={item.id}
                  style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(255, 107, 53, 0.08)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr auto',
                    gap: '20px',
                    alignItems: 'center'
                  }}>
                    {/* Item Image */}
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      background: 'linear-gradient(135deg, #FFE8DD 0%, #FFF5F0 100%)',
                      position: 'relative',
                      boxShadow: '0 4px 16px rgba(255, 107, 53, 0.1)'
                    }}>
                      {item.menu_item.image ? (
                        <img 
                          src={item.menu_item.image} 
                          alt={item.menu_item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.setAttribute('style', 'display: flex');
                          }}
                        />
                      ) : null}
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: item.menu_item.image ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        position: item.menu_item.image ? 'absolute' : 'static',
                        top: 0,
                        left: 0
                      }}>
                        🍽️
                      </div>
                      
                      {/* Dietary badges */}
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        display: 'flex',
                        gap: '4px'
                      }}>
                        {item.menu_item.is_vegetarian && (
                          <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#22C55E',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px'
                          }}>
                            🟢
                          </div>
                        )}
                        {item.menu_item.is_spicy && (
                          <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#EF4444',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px'
                          }}>
                            🌶️
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <h3 style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#333',
                          margin: '0',
                          lineHeight: 1.3
                        }}>
                          {item.menu_item.name}
                        </h3>
                      </div>

                      {item.menu_item.category && (
                        <span style={{
                          background: '#F3F4F6',
                          color: '#6B7280',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          marginBottom: '8px',
                          display: 'inline-block'
                        }}>
                          {item.menu_item.category.name}
                        </span>
                      )}

                      {item.menu_item.description && (
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          margin: '8px 0',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {item.menu_item.description}
                        </p>
                      )}

                      <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#FF6B35',
                        margin: '12px 0 8px 0'
                      }}>
                        ₹{item.unit_price} each
                      </div>

                      {item.special_instructions && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#FEF3E2',
                          borderRadius: '8px',
                          border: '1px solid #FDE68A'
                        }}>
                          <p style={{
                            fontSize: '13px',
                            color: '#92400E',
                            margin: 0,
                            fontWeight: '500',
                            lineHeight: 1.4
                          }}>
                            <span style={{ marginRight: '6px' }}>📝</span>
                            Special Instructions: {item.special_instructions}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quantity & Price Controls */}
                    <div style={{ 
                      textAlign: 'right',
                      minWidth: '140px'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#FF6B35',
                        marginBottom: '16px'
                      }}>
                        ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: '#F8FAFC',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        border: '2px solid #E2E8F0',
                        marginBottom: '12px'
                      }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          style={{
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#FF6B35',
                            cursor: updating === item.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: updating === item.id ? 0.5 : 1
                          }}
                          onMouseOver={(e) => {
                            if (updating !== item.id) {
                              e.currentTarget.style.background = '#FFE8DD';
                              e.currentTarget.style.borderColor = '#FF6B35';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (updating !== item.id) {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }
                          }}
                        >
                          −
                        </button>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#333',
                          minWidth: '24px',
                          textAlign: 'center'
                        }}>
                          {updating === item.id ? '...' : item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          style={{
                            background: 'white',
                            border: '1px solid #E2E8F0',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#FF6B35',
                            cursor: updating === item.id ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            opacity: updating === item.id ? 0.5 : 1
                          }}
                          onMouseOver={(e) => {
                            if (updating !== item.id) {
                              e.currentTarget.style.background = '#FFE8DD';
                              e.currentTarget.style.borderColor = '#FF6B35';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (updating !== item.id) {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.borderColor = '#E2E8F0';
                            }
                          }}
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        style={{
                          background: updating === item.id ? '#FEE2E2' : '#FEF2F2',
                          border: `1px solid ${updating === item.id ? '#FECACA' : '#FDE2E2'}`,
                          color: updating === item.id ? '#DC2626' : '#EF4444',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: updating === item.id ? 'not-allowed' : 'pointer',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          if (updating !== item.id) {
                            e.currentTarget.style.background = '#FEE2E2';
                            e.currentTarget.style.borderColor = '#FECACA';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (updating !== item.id) {
                            e.currentTarget.style.background = '#FEF2F2';
                            e.currentTarget.style.borderColor = '#FDE2E2';
                          }
                        }}
                      >
                        {updating === item.id ? (
                          <>⏳ Removing...</>
                        ) : (
                          <>🗑️ Remove</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div style={{
              background: 'white',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              border: '1px solid rgba(255, 107, 53, 0.08)',
              position: 'sticky',
              top: '20px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '800',
                color: '#333',
                margin: '0 0 24px 0',
                background: 'linear-gradient(135deg, #333 0%, #666 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Bill Details
              </h2>

              {/* Promo Code Section */}
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #FEF3E2 0%, #FFF7ED 100%)',
                borderRadius: '16px',
                border: '2px dashed #FB923C'
              }}>
                <button
                  onClick={() => setShowPromo(!showPromo)}
                  style={{
                    background: 'none',
                    border: 'none',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🎟️ Apply Promo Code
                  </span>
                  <span style={{ 
                    color: '#EA580C',
                    fontSize: '16px',
                    transform: showPromo ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▼
                  </span>
                </button>
                
                {showPromo && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '12px 16px',
                          border: '2px solid #E2E8F0',
                          borderRadius: '12px',
                          fontSize: '14px',
                          outline: 'none',
                          background: 'white',
                          transition: 'border-color 0.2s ease'
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = '#FF6B35'}
                        onBlur={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                      />
                      <button
                        onClick={applyPromoCode}
                        style={{
                          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        Apply
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.4 }}>
                      Try: <strong>SAVE10</strong>, <strong>FIRST20</strong>, or <strong>WELCOME15</strong>
                    </div>
                    {discount > 0 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '8px 12px',
                        background: '#DCFCE7',
                        borderRadius: '8px',
                        border: '1px solid #BBF7D0'
                      }}>
                        <p style={{
                          fontSize: '13px',
                          color: '#166534',
                          margin: 0,
                          fontWeight: '600'
                        }}>
                          ✅ {discount}% discount applied successfully!
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{
                borderTop: '2px solid #F1F5F9',
                paddingTop: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <span style={{ color: '#666', fontSize: '15px' }}>Item Total</span>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>₹{totals.subtotal}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <span style={{ color: '#666', fontSize: '15px' }}>Delivery Fee</span>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>₹{totals.deliveryFee}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <span style={{ color: '#666', fontSize: '15px' }}>Taxes & Charges</span>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>₹{totals.taxes}</span>
                </div>

                {discount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <span style={{ color: '#22C55E', fontSize: '15px', fontWeight: '500' }}>
                      Discount ({discount}%)
                    </span>
                    <span style={{ color: '#22C55E', fontSize: '15px', fontWeight: '700' }}>
                      -₹{totals.discount}
                    </span>
                  </div>
                )}

                <div style={{
                  borderTop: '2px solid #F1F5F9',
                  paddingTop: '20px',
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '32px'
                }}>
                  <span style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#333'
                  }}>
                    To Pay
                  </span>
                  <span style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: '#FF6B35'
                  }}>
                    ₹{totals.total}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '18px',
                    borderRadius: '16px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)',
                    transition: 'all 0.3s ease',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 107, 53, 0.4)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 53, 0.3)';
                  }}
                >
                  <span>🚀</span>
                  Proceed to Checkout
                </button>

                <p style={{
                  fontSize: '12px',
                  color: '#94A3B8',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  By placing your order, you agree to our <br />
                  <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
