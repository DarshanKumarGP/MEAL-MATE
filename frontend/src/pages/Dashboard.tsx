import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  favoriteRestaurant: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersResponse] = await Promise.all([
        api.get('/orders/orders/?limit=5')
      ]);

      const orders = ordersResponse.data.results || [];
      setRecentOrders(orders);

      // Calculate stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
      const deliveredOrders = orders.filter((o: any) => o.status === 'DELIVERED').length;
      const totalSpent = orders.reduce((sum: number, order: any) => 
        sum + parseFloat(order.final_amount || order.total_amount), 0
      );

      setStats({
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalSpent,
        favoriteRestaurant: 'The Hungry Oven' // This would come from analytics
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        Loading dashboard...
      </div>
    );
  }

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
        {/* Header */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h1 style={{
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.gray[900],
            margin: '0 0 8px 0'
          }}>
            Welcome back, {user?.username}! 👋
          </h1>
          <p style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.gray[600],
            margin: 0
          }}>
            Here's what's happening with your orders and account
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl
        }}>
          <Button
            size="lg"
            onClick={() => navigate('/restaurants')}
            style={{ height: '60px' }}
          >
            🍽️ Order Food
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/orders')}
            style={{ height: '60px' }}
          >
            📋 View Orders
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/addresses')}
            style={{ height: '60px' }}
          >
            📍 Manage Addresses
          </Button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: theme.spacing.lg,
            marginBottom: theme.spacing.xl
          }}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: theme.spacing.sm
                }}>📊</div>
                <h3 style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary.main,
                  margin: '0 0 8px 0'
                }}>
                  {stats.totalOrders}
                </h3>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.gray[600],
                  margin: 0
                }}>
                  Total Orders
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: theme.spacing.sm
                }}>⏳</div>
                <h3 style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.warning,
                  margin: '0 0 8px 0'
                }}>
                  {stats.pendingOrders}
                </h3>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.gray[600],
                  margin: 0
                }}>
                  Pending Orders
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: theme.spacing.sm
                }}>✅</div>
                <h3 style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.success,
                  margin: '0 0 8px 0'
                }}>
                  {stats.deliveredOrders}
                </h3>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.gray[600],
                  margin: 0
                }}>
                  Delivered Orders
                </p>
              </div>
            </Card>

            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: theme.spacing.sm
                }}>💰</div>
                <h3 style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.primary.main,
                  margin: '0 0 8px 0'
                }}>
                  ₹{stats.totalSpent.toFixed(2)}
                </h3>
                <p style={{
                  fontSize: theme.typography.fontSize.base,
                  color: theme.colors.gray[600],
                  margin: 0
                }}>
                  Total Spent
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Orders */}
        <Card>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.lg
          }}>
            <h2 style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              margin: 0
            }}>
              Recent Orders
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/orders')}
            >
              View All →
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: theme.spacing.xl }}>
              <div style={{ fontSize: '3rem', marginBottom: theme.spacing.md }}>📱</div>
              <h3 style={{
                color: theme.colors.gray[600],
                margin: '0 0 16px 0'
              }}>
                No orders yet
              </h3>
              <Button onClick={() => navigate('/restaurants')}>
                Order your first meal
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {recentOrders.slice(0, 3).map(order => (
                <div
                  key={order.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.gray[50],
                    borderRadius: theme.borderRadius.md,
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/orders')}
                >
                  <div>
                    <p style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.medium,
                      color: theme.colors.gray[900],
                      margin: '0 0 4px 0'
                    }}>
                      Order #{order.order_number}
                    </p>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.gray[600],
                      margin: 0
                    }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      backgroundColor: theme.colors.warning,
                      color: theme.colors.white,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                      marginBottom: theme.spacing.xs,
                      display: 'block'
                    }}>
                      {order.status}
                    </span>
                    <p style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.gray[900],
                      margin: 0
                    }}>
                      ₹{order.final_amount || (parseFloat(order.total_amount) + parseFloat(order.delivery_fee)).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
