import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

interface Order {
  id: number;
  order_number: string;
  restaurant_name: string;
  restaurant_details: {
    id: number;
    name: string;
    phone: string;
    cuisine_type: string;
  };
  status: string;
  total_amount: string;
  delivery_fee: string;
  final_amount: string;
  created_at: string;
  delivery_address: {
    label: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  payment_method: string;
  payment_status: string;
  items?: OrderItem[];
}

const statusConfig = {
  PENDING: { color: '#4CAF50', icon: '⏳', label: 'Pending' },
  CONFIRMED: { color: '#2196F3', icon: '✓', label: 'Confirmed' },
  PREPARING: { color: '#FF9800', icon: '👨‍🍳', label: 'Preparing' },
  READY: { color: '#9C27B0', icon: '📦', label: 'Ready' },
  OUT_FOR_DELIVERY: { color: '#FF6B35', icon: '🏍️', label: 'Out for Delivery' },
  DELIVERED: { color: '#4CAF50', icon: '✓', label: 'Delivered' },
  CANCELLED: { color: '#F44336', icon: '✗', label: 'Cancelled' },
  REFUNDED: { color: '#6c757d', icon: '↩', label: 'Refunded' }
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/orders/');
      setOrders(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const response = await api.get(`/orders/order-items/?order=${orderId}`);
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to fetch order items:', error);
      return [];
    }
  };

  const handleExpandOrder = async (orderId: number) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }

    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex !== -1 && !orders[orderIndex].items) {
      const items = await fetchOrderItems(orderId);
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], items };
      setOrders(updatedOrders);
    }
    
    setExpandedOrder(orderId);
  };

  const getStatusConfig = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDING': '#ffc107',
      'PAID': '#28a745',
      'FAILED': '#dc3545',
      'REFUNDED': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        maxWidth: '900px', 
        margin: '0 auto',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            height: '28px',
            width: '200px',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '4px'
          }} />
          <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        </div>
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            style={{ 
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: 'white'
            }}
          >
            <div style={{
              height: '20px',
              width: '60%',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '4px',
              marginBottom: '12px'
            }} />
            <div style={{
              height: '14px',
              width: '40%',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '4px',
              marginBottom: '16px'
            }} />
            <div style={{
              height: '14px',
              width: '80%',
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
              borderRadius: '4px'
            }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '32px', 
            fontWeight: '700',
            color: '#333',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Your Orders
          </h1>
          <button
            onClick={() => navigate('/restaurants')}
            style={{
              background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(255,107,53,0.3)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255,107,53,0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,107,53,0.3)';
            }}
          >
            + Order Again
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 20px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
            <h3 style={{ 
              color: '#333', 
              marginBottom: '12px',
              fontSize: '24px',
              fontWeight: '600'
            }}>
              No orders yet
            </h3>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '15px' }}>
              When you place orders, they'll appear here
            </p>
            <button 
              onClick={() => navigate('/restaurants')}
              style={{
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,107,53,0.3)'
              }}
            >
              Start Ordering
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map(order => {
              const { date, time } = formatDate(order.created_at);
              const isExpanded = expandedOrder === order.id;
              const statusInfo = getStatusConfig(order.status);
              
              return (
                <div 
                  key={order.id} 
                  style={{ 
                    border: 'none',
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Order Header */}
                  <div style={{ padding: '20px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          margin: '0 0 6px 0',
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#333'
                        }}>
                          Order #{order.order_number}
                        </h3>
                        <p style={{ 
                          margin: '0',
                          fontSize: '13px',
                          color: '#999'
                        }}>
                          {date} • {time}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* Status Badge */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: `${statusInfo.color}15`,
                          color: statusInfo.color,
                          padding: '8px 14px',
                          borderRadius: '10px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          <span>{statusInfo.icon}</span>
                          <span>{statusInfo.label}</span>
                        </div>
                        
                        {/* Track Order Button */}
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          style={{
                            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '10px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                          Track →
                        </button>
                      </div>
                    </div>

                    {/* Order Info Grid */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '16px',
                      padding: '16px',
                      background: '#FAFAFA',
                      borderRadius: '12px'
                    }}>
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px',
                          fontWeight: '600'
                        }}>
                          Restaurant
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#333',
                          fontWeight: '500'
                        }}>
                          {order.restaurant_name || order.restaurant_details?.name || 'Unknown'}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px',
                          fontWeight: '600'
                        }}>
                          Delivery
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#333',
                          fontWeight: '500'
                        }}>
                          {order.delivery_address?.city}, {order.delivery_address?.state}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px',
                          fontWeight: '600'
                        }}>
                          Payment
                        </div>
                        <div style={{ 
                          fontSize: '14px',
                          color: '#333',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          {order.payment_method}
                          <span style={{ 
                            fontSize: '10px',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: order.payment_status === 'PAID' ? '#E8F5E9' : '#FFF3E0',
                            color: order.payment_status === 'PAID' ? '#4CAF50' : '#FF9800',
                            fontWeight: '600'
                          }}>
                            {order.payment_status}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#999', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          marginBottom: '4px',
                          fontWeight: '600'
                        }}>
                          Total
                        </div>
                        <div style={{ 
                          fontSize: '20px',
                          fontWeight: '700',
                          color: '#FF6B35'
                        }}>
                          ₹{order.final_amount || (parseFloat(order.total_amount) + parseFloat(order.delivery_fee)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Items Section */}
                  <div style={{ 
                    borderTop: '1px solid #F0F0F0',
                    padding: '12px 20px' 
                  }}>
                    <button
                      onClick={() => handleExpandOrder(order.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#FF6B35',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 0',
                        transition: 'opacity 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      {isExpanded ? '▲ Hide Items' : '▼ View Items'}
                    </button>
                    
                    {isExpanded && order.items && (
                      <div style={{ 
                        marginTop: '12px',
                        padding: '16px',
                        backgroundColor: '#FAFAFA',
                        borderRadius: '12px'
                      }}>
                        {order.items.map((item, idx) => (
                          <div 
                            key={item.id}
                            style={{ 
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 0',
                              borderBottom: idx < order.items!.length - 1 ? '1px solid #E0E0E0' : 'none'
                            }}
                          >
                            <div>
                              <div style={{ 
                                fontWeight: '600',
                                color: '#333',
                                fontSize: '14px',
                                marginBottom: '2px'
                              }}>
                                {item.menu_item_name}
                              </div>
                              <div style={{ 
                                fontSize: '12px',
                                color: '#999'
                              }}>
                                ₹{item.unit_price} × {item.quantity}
                              </div>
                            </div>
                            <div style={{ 
                              fontWeight: '700',
                              color: '#FF6B35',
                              fontSize: '15px'
                            }}>
                              ₹{item.subtotal}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;