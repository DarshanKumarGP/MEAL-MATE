import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItemData {
  id: number;
  menu_item: number;
  menu_item_name?: string;
  quantity: number;
  unit_price: string;
}

interface Address {
  id: number;
  label: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<'razorpay' | 'cod'>('razorpay');
  const [orderLoading, setOrderLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchCartItems = async () => {
    try {
      const { data } = await api.get('/orders/cart-items/');
      const items: CartItemData[] = (data.results || []).map((ci: any) => ({
        id: ci.id,
        menu_item: typeof ci.menu_item === 'object' ? ci.menu_item.id : ci.menu_item,
        menu_item_name: typeof ci.menu_item === 'object' ? ci.menu_item.name : 'Menu Item',
        quantity: ci.quantity,
        unit_price: ci.unit_price,
      }));
      setCartItems(items);
    } catch (err) {
      console.error('Failed to fetch cart items:', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await api.get('/core/addresses/');
      const addressList = data.results || [];
      setAddresses(addressList);
      
      const defaultAddr = addressList.find((addr: Address) => addr.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((total, item) => 
      total + (parseFloat(item.unit_price) * item.quantity), 0
    );
    const deliveryFee = 30;
    const taxes = subtotal * 0.05;
    const total = subtotal + deliveryFee + taxes;

    return {
      subtotal: subtotal.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      taxes: taxes.toFixed(2),
      total: total.toFixed(2)
    };
  };

  const createOrder = async () => {
    const totals = calculateTotals();
    
    const orderData = {
      total_amount: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      tax_amount: totals.taxes,
      discount_amount: '0.00',
      delivery_address: {
        label: selectedAddress!.label,
        address_line_1: selectedAddress!.address_line_1,
        address_line_2: selectedAddress!.address_line_2 || '',
        city: selectedAddress!.city,
        state: selectedAddress!.state,
        postal_code: selectedAddress!.postal_code,
      },
      delivery_phone: '9999999999',
      delivery_instructions: '',
      payment_method: selectedPayment.toUpperCase(),
      payment_status: 'PENDING',
      status: 'PENDING',
    };

    console.log('Creating order with data:', orderData);
    const { data: order } = await api.post('/orders/orders/', orderData);
    console.log('Order created successfully:', order);

    for (const item of cartItems) {
      const orderItemData = {
        order: order.id,
        menu_item: item.menu_item,
        quantity: item.quantity,
        unit_price: item.unit_price,
        special_instructions: '',
      };
      
      console.log('Creating order item:', orderItemData);
      await api.post('/orders/order-items/', orderItemData);
    }

    return order;
  };

  const handleRazorpayPayment = async () => {
    try {
      setOrderLoading(true);
      
      const order = await createOrder();
      const totals = calculateTotals();

      const razorpayResponse = await api.post('/payments/payments/create_razorpay_order/', {
        order_id: order.id,
        amount: totals.total
      });

      const options = {
        key: razorpayResponse.data.key_id,
        amount: razorpayResponse.data.amount,
        currency: razorpayResponse.data.currency,
        name: 'MEAL-MATE',
        description: `Order #${order.order_number}`,
        order_id: razorpayResponse.data.razorpay_order_id,
        handler: async (response: any) => {
          try {
            await api.post('/payments/payments/verify_payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            await Promise.all(
              cartItems.map((item) =>
                api.delete(`/orders/cart-items/${item.id}/`)
              )
            );

            addToast(`Payment successful! Order #${order.order_number}`, 'success');
            navigate(`/orders/${order.id}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            addToast('Payment verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#FF6B35'
        },
        modal: {
          ondismiss: () => {
            setOrderLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initiation failed:', error);
      addToast('Failed to initiate payment', 'error');
      setOrderLoading(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      setOrderLoading(true);
      
      const order = await createOrder();
      
      await Promise.all(
        cartItems.map((item) =>
          api.delete(`/orders/cart-items/${item.id}/`)
        )
      );

      addToast(`Order placed successfully! Order #${order.order_number}`, 'success');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Order placement failed:', error);
      addToast('Failed to place order', 'error');
    } finally {
      setOrderLoading(false);
    }
  };

  const placeOrder = () => {
    if (selectedPayment === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleCODOrder();
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.gray[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
          <h2>Your cart is empty</h2>
          <Button onClick={() => navigate('/restaurants')}>
            Browse Restaurants
          </Button>
        </Card>
      </div>
    );
  }

  const totals = calculateTotals();

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
        {/* Progress Steps */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: theme.spacing.xl
        }}>
          {[
            { num: 1, title: 'Address' },
            { num: 2, title: 'Payment' },
            { num: 3, title: 'Review' }
          ].map((s) => (
            <div
              key={s.num}
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: `0 ${theme.spacing.lg}`
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step >= s.num ? theme.colors.primary.main : theme.colors.gray[300],
                color: theme.colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: theme.typography.fontWeight.semibold
              }}>
                {s.num}
              </div>
              <span style={{
                marginLeft: theme.spacing.sm,
                color: step >= s.num ? theme.colors.primary.main : theme.colors.gray[500],
                fontWeight: theme.typography.fontWeight.medium
              }}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 400px',
          gap: theme.spacing.xl
        }}>
          {/* Main Content */}
          <div>
            {step === 1 && (
              <Card>
                <h2 style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  margin: `0 0 ${theme.spacing.lg} 0`
                }}>
                  Select Delivery Address
                </h2>
                
                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
                    <p>No addresses found</p>
                    <Button onClick={() => navigate('/addresses')}>
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        style={{
                          padding: theme.spacing.md,
                          border: `2px solid ${selectedAddress?.id === addr.id ? theme.colors.primary.main : theme.colors.gray[200]}`,
                          borderRadius: theme.borderRadius.md,
                          cursor: 'pointer',
                          backgroundColor: selectedAddress?.id === addr.id ? theme.colors.primary[50] : 'white'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
                          <input
                            type="radio"
                            checked={selectedAddress?.id === addr.id}
                            onChange={() => setSelectedAddress(addr)}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <h4 style={{
                              margin: '0 0 4px 0',
                              color: theme.colors.gray[900]
                            }}>
                              {addr.label}
                              {addr.is_default && (
                                <span style={{
                                  marginLeft: theme.spacing.sm,
                                  fontSize: theme.typography.fontSize.xs,
                                  backgroundColor: theme.colors.success,
                                  color: 'white',
                                  padding: `2px ${theme.spacing.xs}`,
                                  borderRadius: theme.borderRadius.sm
                                }}>
                                  Default
                                </span>
                              )}
                            </h4>
                            <p style={{
                              margin: 0,
                              color: theme.colors.gray[600],
                              fontSize: theme.typography.fontSize.sm
                            }}>
                              {addr.address_line_1}
                              {addr.address_line_2 && `, ${addr.address_line_2}`}
                              <br />
                              {addr.city}, {addr.state} {addr.postal_code}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: theme.spacing.lg
                }}>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/addresses')}
                  >
                    + Add New Address
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddress}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card>
                <h2 style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  margin: `0 0 ${theme.spacing.lg} 0`
                }}>
                  Select Payment Method
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                  <div
                    onClick={() => setSelectedPayment('razorpay')}
                    style={{
                      padding: theme.spacing.md,
                      border: `2px solid ${selectedPayment === 'razorpay' ? theme.colors.primary.main : theme.colors.gray[200]}`,
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: selectedPayment === 'razorpay' ? theme.colors.primary[50] : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <input
                        type="radio"
                        checked={selectedPayment === 'razorpay'}
                        onChange={() => setSelectedPayment('razorpay')}
                      />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>💳 Pay Online</h4>
                        <p style={{
                          margin: 0,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.gray[600]
                        }}>
                          Pay securely using UPI, Cards, Net Banking, or Wallets
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedPayment('cod')}
                    style={{
                      padding: theme.spacing.md,
                      border: `2px solid ${selectedPayment === 'cod' ? theme.colors.primary.main : theme.colors.gray[200]}`,
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: selectedPayment === 'cod' ? theme.colors.primary[50] : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                      <input
                        type="radio"
                        checked={selectedPayment === 'cod'}
                        onChange={() => setSelectedPayment('cod')}
                      />
                      <div>
                        <h4 style={{ margin: '0 0 4px 0' }}>💰 Cash on Delivery</h4>
                        <p style={{
                          margin: 0,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.gray[600]
                        }}>
                          Pay with cash when your order is delivered
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: theme.spacing.lg
                }}>
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    ← Back to Address
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Review Order
                  </Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card>
                <h2 style={{
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.semibold,
                  margin: `0 0 ${theme.spacing.lg} 0`
                }}>
                  Review Your Order
                </h2>

                <div style={{
                  backgroundColor: theme.colors.gray[50],
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg
                }}>
                  <h4 style={{ margin: `0 0 ${theme.spacing.md} 0` }}>Order Items</h4>
                  {cartItems.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: theme.spacing.sm
                      }}
                    >
                      <span>{item.menu_item_name} × {item.quantity}</span>
                      <span>₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  backgroundColor: theme.colors.gray[50],
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg
                }}>
                  <h4 style={{ margin: `0 0 ${theme.spacing.sm} 0` }}>Delivery Address</h4>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm }}>
                    <strong>{selectedAddress?.label}</strong><br />
                    {selectedAddress?.address_line_1}<br />
                    {selectedAddress?.city}, {selectedAddress?.state} {selectedAddress?.postal_code}
                  </p>
                </div>

                <div style={{
                  backgroundColor: theme.colors.gray[50],
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg
                }}>
                  <h4 style={{ margin: `0 0 ${theme.spacing.sm} 0` }}>Payment Method</h4>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm }}>
                    {selectedPayment === 'razorpay' ? '💳 Pay Online' : '💰 Cash on Delivery'}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: theme.spacing.lg
                }}>
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    ← Back to Payment
                  </Button>
                  <Button
                    onClick={placeOrder}
                    disabled={orderLoading}
                    isLoading={orderLoading}
                  >
                    {selectedPayment === 'razorpay' 
                      ? `Pay ₹${totals.total}` 
                      : `Place Order - ₹${totals.total}`
                    }
                  </Button>
                </div>
              </Card>
            )}
          </div>

          <Card style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <h3 style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              margin: `0 0 ${theme.spacing.lg} 0`
            }}>
              Order Summary
            </h3>

            <div style={{ marginBottom: theme.spacing.lg }}>
              {cartItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: theme.spacing.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                >
                  <span>{item.menu_item_name} × {item.quantity}</span>
                  <span>₹{(parseFloat(item.unit_price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <hr style={{
              border: 'none',
              borderTop: `1px solid ${theme.colors.gray[200]}`,
              margin: `${theme.spacing.md} 0`
            }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: theme.spacing.sm
            }}>
              <span>Subtotal</span>
              <span>₹{totals.subtotal}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: theme.spacing.sm
            }}>
              <span>Delivery Fee</span>
              <span>₹{totals.deliveryFee}</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: theme.spacing.sm
            }}>
              <span>Taxes & Fees</span>
              <span>₹{totals.taxes}</span>
            </div>

            <hr style={{
              border: 'none',
              borderTop: `1px solid ${theme.colors.gray[200]}`,
              margin: `${theme.spacing.md} 0`
            }} />

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold
            }}>
              <span>Total</span>
              <span style={{ color: theme.colors.primary.main }}>₹{totals.total}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;