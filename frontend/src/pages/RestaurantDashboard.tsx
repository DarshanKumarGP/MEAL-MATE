import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

interface AnalyticsData {
  total_orders: number;
  orders_this_week: number;
  orders_this_month: number;
  average_rating: number;
  total_reviews: number;
  revenue_this_month: number;
  popular_items: Array<{
    name: string;
    category__name: string;
    order_count: number;
  }>;
  daily_orders: Array<{
    date: string;
    orders: number;
  }>;
}

interface Order {
  id: number;
  order_number: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
  };
  status: string;
  total_amount: string;
  created_at: string;
  items: Array<{
    menu_item_name: string;
    quantity: number;
    unit_price: string;
  }>;
}

// Add a Review type if needed
interface ReviewData {
  id: number;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

// Add a MenuItem type for new item interface
interface MenuItemData {
  name: string;
  price: number;
  category: string;
  description?: string;
}

const RestaurantDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'reviews'>('overview');
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<MenuItemData>({ name: '', price: 0, category: '' });
  const { addToast } = useToast();

  // For demo: get this from auth/user context in prod
  const restaurantId = 1;

  useEffect(() => {
    if (activeTab === 'reviews') {
      fetchReviews();
    }
    if (activeTab === 'menu') {
      fetchMenuItems();
    }
    // Always fetch analytics and orders
    fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        api.get(`/restaurants/restaurants/${restaurantId}/analytics/`),
        api.get(`/orders/orders/?restaurant=${restaurantId}`),
      ]);
      setAnalytics(analyticsRes.data);
      setOrders(ordersRes.data.results || []);
    } catch (error) {
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/restaurants/restaurants/${restaurantId}/reviews/`);
      setReviews(res.data.results || []);
    } catch {
      setReviews([]);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const res = await api.get(`/restaurants/menu-items/?restaurant=${restaurantId}`);
      setMenuItems(res.data.results || []);
    } catch {
      setMenuItems([]);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await api.patch(`/orders/orders/${orderId}/`, { status: newStatus });
      addToast(`Order ${newStatus.toLowerCase()} successfully`, 'success');
      fetchData();
    } catch {
      addToast('Failed to update order status', 'error');
    }
  };

  const handleAddMenuItem = async () => {
    if (!newItem.name || !newItem.category || !newItem.price) {
      addToast('Please fill name, category, and price.', 'error');
      return;
    }
    setAddingItem(true);
    try {
      await api.post('/restaurants/menu-items/', { ...newItem, restaurant: restaurantId });
      setNewItem({ name: '', price: 0, category: '' });
      setAddingItem(false);
      fetchMenuItems();
      addToast('Menu item added!', 'success');
    } catch {
      addToast('Failed to add menu item.', 'error');
      setAddingItem(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': theme.colors.warning,
      'CONFIRMED': theme.colors.info,
      'PREPARING': theme.colors.primary.main,
      'READY': '#8e24aa',
      'OUT_FOR_DELIVERY': '#2196f3',
      'DELIVERED': theme.colors.success,
      'CANCELLED': theme.colors.error
    };
    return colors[status] || theme.colors.gray[500];
  };

  const TabButton: React.FC<{ tab: typeof activeTab; children: React.ReactNode }> = ({ tab, children }) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        background: activeTab === tab ? theme.colors.primary.main : 'transparent',
        color: activeTab === tab ? 'white' : theme.colors.gray[600],
        border: 'none',
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {children}
    </button>
  );

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading dashboard...
      </div>
    );
  }

  // -- Restaurant Dashboard UI --
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.gray[50],
      fontFamily: theme.typography.fontFamily
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: theme.spacing.lg
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl
        }}>
          <div>
            <h1 style={{
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.gray[900],
              margin: `0 0 ${theme.spacing.sm} 0`
            }}>
              🏪 Restaurant Dashboard
            </h1>
            <p style={{ color: theme.colors.gray[600], margin: 0 }}>
              Manage your restaurant, orders, and performance
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xl,
          backgroundColor: 'white',
          padding: theme.spacing.sm,
          borderRadius: theme.borderRadius.lg,
          boxShadow: theme.shadows.sm
        }}>
          <TabButton tab="overview">📈 Overview</TabButton>
          <TabButton tab="orders">📋 Orders ({orders.length})</TabButton>
          <TabButton tab="menu">🍽️ Menu</TabButton>
          <TabButton tab="reviews">⭐ Reviews</TabButton>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <div>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.xl
            }}>
              <Card>
                <div style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary.main,
                  marginBottom: theme.spacing.sm
                }}>
                  {analytics.total_orders}
                </div>
                <div style={{
                  color: theme.colors.gray[600],
                  fontSize: theme.typography.fontSize.sm
                }}>
                  Total Orders
                </div>
                <div style={{
                  color: theme.colors.success,
                  fontSize: theme.typography.fontSize.xs,
                  marginTop: theme.spacing.xs
                }}>
                  +{analytics.orders_this_week} this week
                </div>
              </Card>
              <Card>
                <div style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.success,
                  marginBottom: theme.spacing.sm
                }}>
                  ₹{analytics.revenue_this_month?.toLocaleString() || '0'}
                </div>
                <div style={{
                  color: theme.colors.gray[600],
                  fontSize: theme.typography.fontSize.sm
                }}>
                  Monthly Revenue
                </div>
              </Card>
              <Card>
                <div style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.warning,
                  marginBottom: theme.spacing.sm,
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.xs
                }}>
                  ⭐ {analytics.average_rating?.toFixed(1) || '0.0'}
                </div>
                <div style={{
                  color: theme.colors.gray[600],
                  fontSize: theme.typography.fontSize.sm
                }}>
                  Average Rating
                </div>
                <div style={{
                  color: theme.colors.gray[500],
                  fontSize: theme.typography.fontSize.xs,
                  marginTop: theme.spacing.xs
                }}>
                  {analytics.total_reviews} reviews
                </div>
              </Card>
              <Card>
                <div style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.info,
                  marginBottom: theme.spacing.sm
                }}>
                  {analytics.orders_this_month}
                </div>
                <div style={{
                  color: theme.colors.gray[600],
                  fontSize: theme.typography.fontSize.sm
                }}>
                  Orders This Month
                </div>
              </Card>
            </div>

            {/* Orders Trend Chart & Popular Items */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: theme.spacing.lg,
              marginBottom: theme.spacing.xl
            }}>
              {/* Daily Orders Chart */}
              <Card>
                <h3 style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  margin: `0 0 ${theme.spacing.lg} 0`
                }}>
                  📊 Orders Trend (Last 7 Days)
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'end',
                  gap: theme.spacing.md,
                  height: '200px',
                  padding: `${theme.spacing.md} 0`
                }}>
                  {analytics.daily_orders.map((day, index) => (
                    <div key={day.date} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <div style={{
                        backgroundColor: theme.colors.primary.main,
                        width: '100%',
                        borderRadius: `${theme.borderRadius.sm} ${theme.borderRadius.sm} 0 0`,
                        display: 'flex',
                        alignItems: 'end',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.medium,
                        height: `${(day.orders / Math.max(...analytics.daily_orders.map(d => d.orders) || [1])) * 150 + 20}px`,
                        minHeight: '20px',
                        transition: 'height 0.3s ease'
                      }}>
                        {day.orders}
                      </div>
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.gray[500],
                        marginTop: theme.spacing.sm,
                        textAlign: 'center'
                      }}>
                        {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
              {/* Popular Items */}
              <Card>
                <h3 style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  margin: `0 0 ${theme.spacing.lg} 0`
                }}>
                  🔥 Popular Items
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                  {analytics.popular_items.slice(0, 5).map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: theme.typography.fontWeight.medium,
                          fontSize: theme.typography.fontSize.sm
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.gray[500]
                        }}>
                          {item.category__name}
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: theme.colors.primary[50],
                        color: theme.colors.primary.main,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium
                      }}>
                        {item.order_count} orders
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h3 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              margin: 0,
              marginBottom: theme.spacing.lg
            }}>
              Recent Orders
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {orders.map(order => (
                <Card key={order.id}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto auto',
                    gap: theme.spacing.lg,
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: theme.typography.fontWeight.semibold,
                        fontSize: theme.typography.fontSize.base
                      }}>
                        #{order.order_number}
                      </div>
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.gray[500]
                      }}>
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontWeight: theme.typography.fontWeight.medium,
                        marginBottom: theme.spacing.xs
                      }}>
                        {order.customer.first_name} {order.customer.last_name}
                      </div>
                      <div style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.gray[600]
                      }}>
                        ₹{order.total_amount}
                      </div>
                    </div>
                    <div>
                      <span style={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium
                      }}>
                        {order.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                      {order.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'CONFIRMED')}
                        >
                          Accept
                        </Button>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === 'PREPARING' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'READY')}
                        >
                          Ready
                        </Button>
                      )}
                      {order.status === 'READY' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                        >
                          Out for Delivery
                        </Button>
                      )}
                    </div>
                  </div>
                  {order.items && (
                    <div style={{
                      marginTop: theme.spacing.md,
                      paddingTop: theme.spacing.md,
                      borderTop: `1px solid ${theme.colors.gray[200]}`,
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.gray[600]
                    }}>
                      <strong>Items:</strong> {order.items.map(item =>
                        `${item.menu_item_name} x${item.quantity}`
                      ).join(', ')}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <h3 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              margin: 0,
              marginBottom: theme.spacing.lg
            }}>
              Menu Management
            </h3>
            <div style={{
              marginBottom: theme.spacing.md,
              display: 'flex',
              gap: theme.spacing.md
            }}>
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                style={{
                  padding: theme.spacing.sm,
                  minWidth: '120px',
                  border: `1px solid ${theme.colors.gray[300]}`,
                  borderRadius: theme.borderRadius.sm
                }}
              />
              <input
                type="number"
                placeholder="Price"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                style={{
                  padding: theme.spacing.sm,
                  minWidth: '80px',
                  border: `1px solid ${theme.colors.gray[300]}`,
                  borderRadius: theme.borderRadius.sm
                }}
              />
              <input
                type="text"
                placeholder="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                style={{
                  padding: theme.spacing.sm,
                  minWidth: '100px',
                  border: `1px solid ${theme.colors.gray[300]}`,
                  borderRadius: theme.borderRadius.sm
                }}
              />
              <input
                type="text"
                placeholder="Description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                style={{
                  padding: theme.spacing.sm,
                  minWidth: '180px',
                  border: `1px solid ${theme.colors.gray[300]}`,
                  borderRadius: theme.borderRadius.sm
                }}
              />
              <Button onClick={handleAddMenuItem} size="sm" disabled={addingItem}>
                {addingItem ? 'Adding...' : 'Add Item'}
              </Button>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing.md,
            }}>
              {menuItems.map((item, i) => (
                <Card key={i}>
                  <div style={{ fontWeight: theme.typography.fontWeight.medium }}>{item.name}</div>
                  <div>₹{item.price}</div>
                  <div style={{ color: theme.colors.gray[500], fontSize: theme.typography.fontSize.sm }}>
                    {item.category}
                  </div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[400] }}>
                    {item.description || ''}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <h3 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              margin: 0,
              marginBottom: theme.spacing.lg
            }}>
              Customer Reviews
            </h3>
            <div style={{ display: 'grid', gap: theme.spacing.md }}>
              {reviews.length === 0 && (
                <Card style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '40px' }}>⭐</div>
                  <div>No reviews yet.</div>
                </Card>
              )}
              {reviews.map(r => (
                <Card key={r.id}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <span style={{ fontSize: '20px' }}>⭐ {r.rating}</span>
                    <span>{r.customer.first_name} {r.customer.last_name} ({r.customer.email})</span>
                  </div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[700] }}>
                    {r.comment}
                  </div>
                  <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[400] }}>
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
