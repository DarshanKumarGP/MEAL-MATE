// src/pages/OrderDetail.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
}

interface StatusEntry {
  id: number;
  status: string;
  created_at: string;
  notes: string;
}

interface OrderDetail {
  id: number;
  order_number: string;
  restaurant_name: string;
  status: string;
  total_amount: string;
  delivery_fee: string;
  tax_amount: string;
  discount_amount: string;
  final_amount: string;
  delivery_address: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  payment_method: string;
  payment_status: string;
  created_at: string;
}

const statusConfig = {
  PENDING: { 
    label: 'Order Placed', 
    icon: '✓', 
    color: '#4CAF50',
    message: 'Your order has been received',
    subMessage: 'Waiting for restaurant confirmation'
  },
  CONFIRMED: { 
    label: 'Confirmed', 
    icon: '🎉', 
    color: '#2196F3',
    message: 'Restaurant accepted your order',
    subMessage: 'Food preparation will start soon'
  },
  PREPARING: { 
    label: 'Preparing', 
    icon: '👨‍🍳', 
    color: '#FF9800',
    message: 'Your food is being prepared',
    subMessage: 'Chef is working on your order'
  },
  READY: { 
    label: 'Ready', 
    icon: '📦', 
    color: '#9C27B0',
    message: 'Your order is ready',
    subMessage: 'Delivery partner will pick up soon'
  },
  OUT_FOR_DELIVERY: { 
    label: 'Out for Delivery', 
    icon: '🏍️', 
    color: '#FF6B35',
    message: 'Order is on the way',
    subMessage: 'Your delivery partner is nearby'
  },
  DELIVERED: { 
    label: 'Delivered', 
    icon: '🎊', 
    color: '#4CAF50',
    message: 'Order delivered successfully',
    subMessage: 'Enjoy your meal!'
  },
  CANCELLED: { 
    label: 'Cancelled', 
    icon: '❌', 
    color: '#F44336',
    message: 'Order was cancelled',
    subMessage: 'Refund will be processed'
  }
};

const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [history, setHistory] = useState<StatusEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
      setPulseKey(prev => prev + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [id]);
  

const fetchAllData = async () => {
  try {
    // Fetch order and items first (critical)
    const [orderRes, itemsRes] = await Promise.all([
      api.get(`/orders/orders/${id}/`),
      api.get(`/orders/order-items/?order=${id}`)
    ]);
    
    setOrder(orderRes.data);
    setItems(itemsRes.data.results || []);
    
    // Fetch history separately (non-critical)
    try {
      const historyRes = await api.get(`/orders/order-status-history/?order=${id}`);
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : historyRes.data.results || []);
    } catch (historyErr) {
      console.warn('Could not fetch order history:', historyErr);
      setHistory([]); // Continue without history
    }
  } catch (err) {
    console.error('Failed to fetch order:', err);
    navigate('/orders');
  } finally {
    setLoading(false);
  }
};

  if (loading || !order) {
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
            width: 60, 
            height: 60, 
            border: '4px solid #FFE8DD',
            borderTop: '4px solid #FF6B35',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#666', fontSize: 16 }}>Loading your order...</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusFlow.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const currentConfig = statusConfig[order.status as keyof typeof statusConfig];

  const getEstimatedTime = () => {
    if (isDelivered) return 'Delivered';
    if (isCancelled) return 'Cancelled';
    
    const minutesMap: { [key: string]: number } = {
      PENDING: 5,
      CONFIRMED: 20,
      PREPARING: 15,
      READY: 10,
      OUT_FOR_DELIVERY: 15
    };
    
    return `${minutesMap[order.status] || 15} mins`;
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF5F0 0%, #FFE8DD 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: 40
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 20px' }}>
          <button
            onClick={() => navigate('/orders')}
            style={{
              background: 'none',
              border: 'none',
              color: '#FF6B35',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 0'
            }}
          >
            ← Back to Orders
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 20px' }}>
        {/* Hero Status Card */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: 32,
          marginBottom: 20,
          boxShadow: '0 8px 24px rgba(255,107,53,0.12)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${currentConfig.color} ${((currentStatusIndex + 1) / statusFlow.length) * 100}%, #E0E0E0 0%)`
          }} />
          
          <div style={{
            fontSize: 56,
            marginBottom: 16,
            animation: pulseKey % 2 === 0 ? 'pulse 1s ease' : 'none'
          }}>
            <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }`}</style>
            {currentConfig.icon}
          </div>
          
          <h2 style={{
            margin: '0 0 8px 0',
            fontSize: 24,
            fontWeight: 700,
            color: currentConfig.color
          }}>
            {currentConfig.message}
          </h2>
          
          <p style={{ margin: '0 0 16px 0', fontSize: 15, color: '#666' }}>
            {currentConfig.subMessage}
          </p>
          
          {!isDelivered && !isCancelled && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: `${currentConfig.color}15`,
              padding: '8px 20px',
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 600,
              color: currentConfig.color
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: currentConfig.color,
                animation: 'blink 1.5s ease infinite'
              }} />
              <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
              Estimated: {getEstimatedTime()}
            </div>
          )}
        </div>

        {/* Progress Timeline */}
        {!isCancelled && (
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: 18, fontWeight: 600 }}>
              Order Progress
            </h3>
            
            <div style={{ position: 'relative' }}>
              {statusFlow.map((status, index) => {
                const config = statusConfig[status as keyof typeof statusConfig];
                const isComplete = index <= currentStatusIndex;
                const isActive = index === currentStatusIndex;
                
                return (
                  <div key={status} style={{ position: 'relative', paddingLeft: 50, paddingBottom: index < statusFlow.length - 1 ? 32 : 0 }}>
                    {index < statusFlow.length - 1 && (
                      <div style={{
                        position: 'absolute',
                        left: 19,
                        top: 40,
                        bottom: -32,
                        width: 2,
                        background: isComplete ? config.color : '#E0E0E0',
                        transition: 'background 0.5s ease'
                      }} />
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: isComplete ? config.color : '#F5F5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                      transition: 'all 0.5s ease',
                      boxShadow: isActive ? `0 0 0 4px ${config.color}20` : 'none',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)'
                    }}>
                      {isComplete ? config.icon : '○'}
                    </div>
                    
                    <div>
                      <div style={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: isComplete ? '#333' : '#999',
                        marginBottom: 4
                      }}>
                        {config.label}
                      </div>
                      <div style={{ fontSize: 13, color: '#999' }}>
                        {isComplete ? (
                          history.find(h => h.status === status) ? 
                            new Date(history.find(h => h.status === status)!.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                            : 'Just now'
                        ) : '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div style={{
          background: 'white',
          borderRadius: 20,
          padding: 32,
          marginBottom: 20,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>
            Order Details
          </h3>
          
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Order ID</span>
              <span style={{ fontWeight: 600 }}>#{order.order_number}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Restaurant</span>
              <span style={{ fontWeight: 600 }}>{order.restaurant_name}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#666' }}>Payment</span>
              <span style={{ fontWeight: 600 }}>
                {order.payment_method} 
                <span style={{ 
                  marginLeft: 8,
                  padding: '2px 8px',
                  background: order.payment_status === 'PAID' ? '#E8F5E9' : '#FFF3E0',
                  color: order.payment_status === 'PAID' ? '#4CAF50' : '#FF9800',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {order.payment_status}
                </span>
              </span>
            </div>
            
            <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 20 }}>
              <div style={{ color: '#666', marginBottom: 8, fontSize: 13 }}>Delivery Address</div>
              <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.6 }}>
                {order.delivery_address.address_line_1}
                {order.delivery_address.address_line_2 && <>, {order.delivery_address.address_line_2}</>}
                <br />
                {order.delivery_address.city}, {order.delivery_address.state} {order.delivery_address.postal_code}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {items.length > 0 && (
          <div style={{
            background: 'white',
            borderRadius: 20,
            padding: 32,
            marginBottom: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: 18, fontWeight: 600 }}>
              Items ({items.length})
            </h3>
            
            {items.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #F5F5F5'
              }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    {item.menu_item_name}
                  </div>
                  <div style={{ fontSize: 13, color: '#999' }}>
                    ₹{item.unit_price} × {item.quantity}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  ₹{item.subtotal}
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '2px solid #F0F0F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span>₹{order.total_amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>Delivery Fee</span>
                <span>₹{order.delivery_fee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>Taxes</span>
                <span>₹{order.tax_amount}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, color: '#4CAF50' }}>
                  <span>Discount</span>
                  <span>-₹{order.discount_amount}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 18,
                fontWeight: 700,
                color: '#FF6B35',
                paddingTop: 12,
                borderTop: '1px solid #F0F0F0'
              }}>
                <span>Total</span>
                <span>₹{order.final_amount}</span>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div style={{
          background: 'linear-gradient(135deg, #FF6B35 0%, #FF8555 100%)',
          borderRadius: 20,
          padding: 32,
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(255,107,53,0.3)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 600 }}>
            Need Help?
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: 14, opacity: 0.9 }}>
            Contact us for any issues with your order
          </p>
          <button style={{
            background: 'white',
            color: '#FF6B35',
            border: 'none',
            padding: '12px 32px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
