import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

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
  order?: {
    order_number: string;
  };
}

interface MenuItemData {
  id: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  is_available: boolean;
  restaurant: number;
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'menu' | 'reviews'>('overview');
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItemData>>({ 
    name: '', 
    price: 0, 
    category: '',
    description: '',
    is_available: true
  });
  const { addToast } = useToast();

  // Get user's restaurants dynamically
  const [userRestaurants, setUserRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<number | null>(null);

  useEffect(() => {
    fetchUserRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant && activeTab) {
      if (activeTab === 'reviews') {
        fetchReviews();
      }
      if (activeTab === 'menu') {
        fetchMenuItems();
      }
      fetchData();
    }
  }, [activeTab, selectedRestaurant]);

  const fetchUserRestaurants = async () => {
    try {
      const response = await api.get(`/restaurants/restaurants/?owner=${user?.id}`);
      const restaurants = response.data.results || response.data || [];
      setUserRestaurants(restaurants);
      if (restaurants.length > 0) {
        setSelectedRestaurant(restaurants[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch user restaurants:', error);
      addToast('Failed to load your restaurants', 'error');
    }
  };

  const fetchData = async () => {
    if (!selectedRestaurant) return;
    
    setLoading(true);
    try {
      // Fetch real analytics data
      const [ordersRes] = await Promise.all([
        api.get(`/orders/orders/?restaurant=${selectedRestaurant}`),
      ]);
      
      const orderData = ordersRes.data.results || [];
      setOrders(orderData);

      // Calculate analytics from real order data
      const now = new Date();
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const ordersThisWeek = orderData.filter((order: Order) => 
        new Date(order.created_at) >= thisWeek
      ).length;

      const ordersThisMonth = orderData.filter((order: Order) => 
        new Date(order.created_at) >= thisMonth
      ).length;

      const revenueThisMonth = orderData
        .filter((order: Order) => new Date(order.created_at) >= thisMonth)
        .reduce((sum: number, order: Order) => sum + parseFloat(order.total_amount), 0);

      // Generate daily orders for last 7 days
      const dailyOrders = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayOrders = orderData.filter((order: Order) => 
          order.created_at.startsWith(dateStr)
        ).length;
        
        dailyOrders.push({
          date: dateStr,
          orders: dayOrders
        });
      }

      // Calculate popular items from orders
      const itemCounts: { [key: string]: { name: string; count: number; category: string } } = {};
      orderData.forEach((order: Order) => {
        order.items?.forEach(item => {
          if (itemCounts[item.menu_item_name]) {
            itemCounts[item.menu_item_name].count += item.quantity;
          } else {
            itemCounts[item.menu_item_name] = {
              name: item.menu_item_name,
              count: item.quantity,
              category: 'Unknown' // You might want to fetch this from menu items
            };
          }
        });
      });

      const popularItems = Object.values(itemCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => ({
          name: item.name,
          category__name: item.category,
          order_count: item.count
        }));

      // Fetch reviews to calculate average rating
      try {
        const reviewsRes = await api.get(`/orders/reviews/?restaurant=${selectedRestaurant}`);
        const reviewsData = reviewsRes.data.results || [];
        const avgRating = reviewsData.length > 0 
          ? reviewsData.reduce((sum: number, review: ReviewData) => sum + review.rating, 0) / reviewsData.length
          : 0;

        setAnalytics({
          total_orders: orderData.length,
          orders_this_week: ordersThisWeek,
          orders_this_month: ordersThisMonth,
          average_rating: avgRating,
          total_reviews: reviewsData.length,
          revenue_this_month: revenueThisMonth,
          popular_items: popularItems,
          daily_orders: dailyOrders
        });
      } catch (reviewError) {
        // If reviews endpoint fails, set analytics without review data
        setAnalytics({
          total_orders: orderData.length,
          orders_this_week: ordersThisWeek,
          orders_this_month: ordersThisMonth,
          average_rating: 0,
          total_reviews: 0,
          revenue_this_month: revenueThisMonth,
          popular_items: popularItems,
          daily_orders: dailyOrders
        });
      }

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      addToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!selectedRestaurant) return;
    try {
      const res = await api.get(`/orders/reviews/?restaurant=${selectedRestaurant}`);
      setReviews(res.data.results || []);
    } catch {
      setReviews([]);
    }
  };

  const fetchMenuItems = async () => {
    if (!selectedRestaurant) return;
    try {
      const res = await api.get(`/restaurants/menu-items/?restaurant=${selectedRestaurant}`);
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
    if (!newItem.name || !newItem.category || !newItem.price || !selectedRestaurant) {
      addToast('Please fill all required fields.', 'error');
      return;
    }
    setAddingItem(true);
    try {
      await api.post('/restaurants/menu-items/', { 
        ...newItem, 
        restaurant: selectedRestaurant 
      });
      setNewItem({ name: '', price: 0, category: '', description: '', is_available: true });
      setAddingItem(false);
      fetchMenuItems();
      addToast('Menu item added!', 'success');
    } catch {
      addToast('Failed to add menu item.', 'error');
      setAddingItem(false);
    }
  };

  const toggleMenuItemAvailability = async (itemId: number, currentStatus: boolean) => {
    try {
      await api.patch(`/restaurants/menu-items/${itemId}/`, { 
        is_available: !currentStatus 
      });
      fetchMenuItems();
      addToast(`Item ${!currentStatus ? 'enabled' : 'disabled'}`, 'success');
    } catch {
      addToast('Failed to update item status', 'error');
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

  if (!selectedRestaurant) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: theme.spacing.md
      }}>
        <h2>No restaurants found</h2>
        <p>You need to have at least one restaurant to access the dashboard.</p>
      </div>
    );
  }

  const currentRestaurant = userRestaurants.find(r => r.id === selectedRestaurant);

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
              {currentRestaurant ? `Managing: ${currentRestaurant.name}` : 'Manage your restaurant, orders, and performance'}
            </p>
          </div>
          
          {/* Restaurant Selector */}
          {userRestaurants.length > 1 && (
            <select
              value={selectedRestaurant || ''}
              onChange={(e) => setSelectedRestaurant(Number(e.target.value))}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray[300]}`,
                fontSize: theme.typography.fontSize.sm
              }}
            >
              {userRestaurants.map(restaurant => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          )}
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
          <TabButton tab="menu">🍽️ Menu ({menuItems.length})</TabButton>
          <TabButton tab="reviews">⭐ Reviews ({reviews.length})</TabButton>
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
              gridTemplateColumns: window.innerWidth > 768 ? '2fr 1fr' : '1fr',
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
                  {analytics.daily_orders.map((day, index) => {
                    const maxOrders = Math.max(...analytics.daily_orders.map(d => d.orders), 1);
                    const height = (day.orders / maxOrders) * 150 + 20;
                    
                    return (
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
                          height: `${height}px`,
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
                    );
                  })}
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
                  {analytics.popular_items.length > 0 ? (
                    analytics.popular_items.slice(0, 5).map((item, index) => (
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
                    ))
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: theme.colors.gray[500],
                      padding: theme.spacing.lg
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: theme.spacing.sm }}>📊</div>
                      <div>No popular items yet</div>
                      <div style={{ fontSize: theme.typography.fontSize.xs }}>Start receiving orders to see trends</div>
                    </div>
                  )}
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
            {orders.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
                <div style={{ fontSize: '4rem', marginBottom: theme.spacing.md }}>📋</div>
                <h4>No orders yet</h4>
                <p style={{ color: theme.colors.gray[600] }}>
                  Orders will appear here once customers start ordering from your restaurant.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                {orders.map(order => (
                  <Card key={order.id}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth > 768 ? 'auto 1fr auto auto' : '1fr',
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
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
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
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                margin: 0
              }}>
                Menu Management
              </h3>
            </div>

            {/* Add New Item Form */}
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <h4 style={{ marginBottom: theme.spacing.md }}>Add New Menu Item</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: theme.spacing.md,
                marginBottom: theme.spacing.md
              }}>
                <input
                  type="text"
                  placeholder="Item Name"
                  value={newItem.name || ''}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  style={{
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                  style={{
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newItem.category || ''}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  style={{
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  style={{
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm,
                    gridColumn: window.innerWidth > 768 ? 'span 2' : 'span 1'
                  }}
                />
                <Button onClick={handleAddMenuItem} disabled={addingItem} style={{ alignSelf: 'end' }}>
                  {addingItem ? 'Adding...' : 'Add Item'}
                </Button>
              </div>
            </Card>

            {/* Menu Items Grid */}
            {menuItems.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
                <div style={{ fontSize: '4rem', marginBottom: theme.spacing.md }}>🍽️</div>
                <h4>No menu items yet</h4>
                <p style={{ color: theme.colors.gray[600] }}>
                  Start adding menu items to your restaurant.
                </p>
              </Card>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: theme.spacing.lg
              }}>
                {menuItems.map((item) => (
                  <Card key={item.id} style={{
                    opacity: item.is_available ? 1 : 0.6,
                    border: `2px solid ${item.is_available ? theme.colors.gray[200] : theme.colors.gray[300]}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1fr',
                      gap: theme.spacing.md,
                      marginBottom: theme.spacing.md
                    }}>
                      {/* Menu Item Image */}
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: theme.borderRadius.md,
                        background: 'linear-gradient(135deg, #FFE8DD 0%, #FFF5F0 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        overflow: 'hidden'
                      }}>
                        {item.image ? (
                          <img
                            src={item.image.startsWith('http') ? item.image : `${api.defaults.baseURL}${item.image}`}
                            alt={item.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          '🍽️'
                        )}
                      </div>

                      {/* Menu Item Details */}
                      <div>
                        <div style={{
                          fontWeight: theme.typography.fontWeight.bold,
                          fontSize: theme.typography.fontSize.lg,
                          marginBottom: theme.spacing.xs,
                          color: theme.colors.gray[900]
                        }}>
                          {item.name}
                        </div>
                        <div style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.primary.main,
                          marginBottom: theme.spacing.xs
                        }}>
                          ₹{item.price}
                        </div>
                        <div style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.gray[600],
                          backgroundColor: theme.colors.gray[100],
                          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                          borderRadius: theme.borderRadius.sm,
                          display: 'inline-block'
                        }}>
                          {item.category}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <div style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.gray[600],
                        marginBottom: theme.spacing.md,
                        lineHeight: 1.4
                      }}>
                        {item.description}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: theme.spacing.md,
                      borderTop: `1px solid ${theme.colors.gray[200]}`
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm
                      }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: item.is_available ? theme.colors.success : theme.colors.error
                        }} />
                        <span style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: item.is_available ? theme.colors.success : theme.colors.error,
                          fontWeight: theme.typography.fontWeight.medium
                        }}>
                          {item.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      
                      <Button
                        size="sm"
                        variant={item.is_available ? "outline" : "primary"}
                        onClick={() => toggleMenuItemAvailability(item.id, item.is_available)}
                      >
                        {item.is_available ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                margin: 0
              }}>
                Customer Reviews
              </h3>
              {reviews.length > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm,
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.warning + '20',
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.warning + '40'}`
                }}>
                  <span style={{ fontSize: '1.2rem' }}>⭐</span>
                  <span style={{
                    fontSize: theme.typography.fontSize.lg,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.warning
                  }}>
                    {analytics ? analytics.average_rating.toFixed(1) : '0.0'}
                  </span>
                  <span style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.gray[600]
                  }}>
                    ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
                <div style={{ fontSize: '4rem', marginBottom: theme.spacing.md }}>⭐</div>
                <h4>No reviews yet</h4>
                <p style={{ color: theme.colors.gray[600] }}>
                  Customer reviews will appear here once you receive orders and customers leave feedback.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gap: theme.spacing.md }}>
                {reviews.map(review => (
                  <Card key={review.id} style={{
                    border: `1px solid ${theme.colors.gray[200]}`,
                    transition: 'all 0.3s ease'
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: window.innerWidth > 768 ? 'auto 1fr auto' : '1fr',
                      gap: theme.spacing.md,
                      alignItems: 'start'
                    }}>
                      {/* Customer Avatar & Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          backgroundColor: theme.colors.primary[100],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.bold,
                          color: theme.colors.primary.main
                        }}>
                          {review.customer.first_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: theme.typography.fontWeight.semibold,
                            fontSize: theme.typography.fontSize.base
                          }}>
                            {review.customer.first_name} {review.customer.last_name}
                          </div>
                          <div style={{
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.gray[500]
                          }}>
                            {new Date(review.created_at).toLocaleDateString()}
                            {review.order && ` • Order #${review.order.order_number}`}
                          </div>
                        </div>
                      </div>

                      {/* Review Content */}
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.spacing.xs,
                          marginBottom: theme.spacing.sm
                        }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span
                              key={star}
                              style={{
                                fontSize: theme.typography.fontSize.lg,
                                color: star <= review.rating ? theme.colors.warning : theme.colors.gray[300]
                              }}
                            >
                              ⭐
                            </span>
                          ))}
                          <span style={{
                            marginLeft: theme.spacing.sm,
                            fontSize: theme.typography.fontSize.sm,
                            color: theme.colors.gray[600],
                            fontWeight: theme.typography.fontWeight.medium
                          }}>
                            {review.rating}/5
                          </span>
                        </div>
                        
                        <div style={{
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.gray[700],
                          lineHeight: 1.5
                        }}>
                          {review.comment || 'No comment provided.'}
                        </div>
                      </div>

                      {/* Rating Badge */}
                      <div style={{
                        backgroundColor: 
                          review.rating >= 4 ? theme.colors.success + '20' :
                          review.rating >= 3 ? theme.colors.warning + '20' :
                          theme.colors.error + '20',
                        color: 
                          review.rating >= 4 ? theme.colors.success :
                          review.rating >= 3 ? theme.colors.warning :
                          theme.colors.error,
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        borderRadius: theme.borderRadius.sm,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.bold,
                        textAlign: 'center',
                        border: `1px solid ${
                          review.rating >= 4 ? theme.colors.success + '40' :
                          review.rating >= 3 ? theme.colors.warning + '40' :
                          theme.colors.error + '40'
                        }`
                      }}>
                        {review.rating >= 4 ? 'EXCELLENT' :
                         review.rating >= 3 ? 'GOOD' :
                         review.rating >= 2 ? 'AVERAGE' : 'POOR'}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;
