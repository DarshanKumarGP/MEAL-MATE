import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface CartItemData {
  id: number;
  menu_item: {
    id: number;
    name: string;
    restaurant: {
      id: number;
      name: string;
      delivery_fee: number;
    };
    price: string;
    image?: string;
  };
  quantity: number;
  unit_price: string;
  subtotal?: string;
  special_instructions?: string;
}

const Cart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await api.get('/orders/cart-items/');
      setCartItems(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
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
      fetchCartItems();
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      await api.delete(`/orders/cart-items/${itemId}/`);
      fetchCartItems();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setUpdating(null);
    }
  };

  const applyPromoCode = () => {
    // Mock promo code logic - replace with actual API call
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(10);
    } else if (promoCode.toUpperCase() === 'FIRST20') {
      setDiscount(20);
    } else {
      alert('Invalid promo code');
      setDiscount(0);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => 
      total + (parseFloat(item.unit_price) * item.quantity), 0
    );
    
    const deliveryFee = cartItems.length > 0 ? 
      (cartItems[0]?.menu_item?.restaurant?.delivery_fee || 30) : 0;
    
    const discountAmount = (subtotal * discount) / 100;
    const taxes = subtotal * 0.05; // 5% tax
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontFamily: theme.typography.fontFamily
      }}>
        <div>Loading your cart...</div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.gray[50],
        fontFamily: theme.typography.fontFamily
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: theme.spacing.lg
        }}>
          <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
            <div style={{ fontSize: '4rem', marginBottom: theme.spacing.lg }}>🛒</div>
            <h2 style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              margin: `0 0 ${theme.spacing.md} 0`
            }}>
              Your cart is empty
            </h2>
            <p style={{
              fontSize: theme.typography.fontSize.base,
              color: theme.colors.gray[600],
              margin: `0 0 ${theme.spacing.lg} 0`
            }}>
              Looks like you haven't added any items to your cart yet
            </p>
            <Button onClick={() => navigate('/restaurants')}>
              Start Shopping
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const restaurant = cartItems[0]?.menu_item?.restaurant;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.gray[50],
      fontFamily: theme.typography.fontFamily
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing.lg
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: theme.spacing.xl
        }}>
          {/* Cart Items */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <h1 style={{
                fontSize: theme.typography.fontSize['3xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.gray[900],
                margin: 0
              }}>
                Your Cart
              </h1>
              <Button
                variant="ghost"
                onClick={() => navigate('/restaurants')}
              >
                + Add More Items
              </Button>
            </div>

            {/* Restaurant Info */}
            {restaurant && (
              <Card style={{ marginBottom: theme.spacing.lg }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md
                }}>
                  <div style={{
                    fontSize: '2rem'
                  }}>🏪</div>
                  <div>
                    <h3 style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.gray[900],
                      margin: 0
                    }}>
                      {restaurant.name}
                    </h3>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.gray[600],
                      margin: 0
                    }}>
                      Delivery Fee: ₹{restaurant.delivery_fee || 30}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {cartItems.map(item => (
                <Card key={item.id}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto auto',
                    gap: theme.spacing.md,
                    alignItems: 'center'
                  }}>
                    {/* Item Image */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      backgroundColor: theme.colors.gray[200],
                      borderRadius: theme.borderRadius.md,
                      backgroundImage: item.menu_item.image ? `url(${item.menu_item.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {!item.menu_item.image && (
                        <span style={{ fontSize: '2rem' }}>🍽️</span>
                      )}
                    </div>

                    {/* Item Details */}
                    <div>
                      <h3 style={{
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.gray[900],
                        margin: '0 0 4px 0'
                      }}>
                        {item.menu_item.name}
                      </h3>
                      <p style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.gray[600],
                        margin: '0 0 8px 0'
                      }}>
                        ₹{item.unit_price} each
                      </p>
                      {item.special_instructions && (
                        <p style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.gray[500],
                          margin: 0,
                          fontStyle: 'italic'
                        }}>
                          Note: {item.special_instructions}
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      border: `1px solid ${theme.colors.gray[300]}`,
                      borderRadius: theme.borderRadius.md,
                      padding: theme.spacing.xs
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: theme.typography.fontSize.base,
                          color: theme.colors.primary.main,
                          cursor: 'pointer',
                          padding: theme.spacing.xs,
                          borderRadius: theme.borderRadius.sm
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: theme.typography.fontWeight.medium,
                        minWidth: '30px',
                        textAlign: 'center'
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={updating === item.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: theme.typography.fontSize.base,
                          color: theme.colors.primary.main,
                          cursor: 'pointer',
                          padding: theme.spacing.xs,
                          borderRadius: theme.borderRadius.sm
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Item Total & Remove */}
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.gray[900],
                        margin: '0 0 8px 0'
                      }}>
                        ₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: theme.colors.error,
                          fontSize: theme.typography.fontSize.sm,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {updating === item.id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <Card style={{ position: 'sticky', top: '100px' }}>
              <h2 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.gray[900],
                margin: `0 0 ${theme.spacing.lg} 0`
              }}>
                Order Summary
              </h2>

              {/* Promo Code */}
              <div style={{ marginBottom: theme.spacing.lg }}>
                <div style={{
                  display: 'flex',
                  gap: theme.spacing.sm,
                  marginBottom: theme.spacing.sm
                }}>
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{
                      flex: 1,
                      padding: theme.spacing.sm,
                      border: `1px solid ${theme.colors.gray[300]}`,
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.sm
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={applyPromoCode}
                  >
                    Apply
                  </Button>
                </div>
                {discount > 0 && (
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.success,
                    margin: 0
                  }}>
                    ✅ {discount}% discount applied!
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div style={{
                borderTop: `1px solid ${theme.colors.gray[200]}`,
                paddingTop: theme.spacing.md
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.sm
                }}>
                  <span style={{ color: theme.colors.gray[600] }}>Subtotal</span>
                  <span>₹{totals.subtotal}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.sm
                }}>
                  <span style={{ color: theme.colors.gray[600] }}>Delivery Fee</span>
                  <span>₹{totals.deliveryFee}</span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.sm
                }}>
                  <span style={{ color: theme.colors.gray[600] }}>Taxes & Fees</span>
                  <span>₹{totals.taxes}</span>
                </div>

                {discount > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.sm
                  }}>
                    <span style={{ color: theme.colors.success }}>Discount</span>
                    <span style={{ color: theme.colors.success }}>-₹{totals.discount}</span>
                  </div>
                )}

                <hr style={{
                  border: 'none',
                  borderTop: `1px solid ${theme.colors.gray[200]}`,
                  margin: `${theme.spacing.md} 0`
                }} />

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: theme.spacing.lg
                }}>
                  <span style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.semibold
                  }}>
                    Total
                  </span>
                  <span style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary.main
                  }}>
                    ₹{totals.total}
                  </span>
                </div>

                <Button
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  style={{ width: '100%' }}
                >
                  Proceed to Checkout
                </Button>

                <p style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.gray[500],
                  textAlign: 'center',
                  margin: `${theme.spacing.sm} 0 0 0`
                }}>
                  By placing your order, you agree to our Terms & Conditions
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
