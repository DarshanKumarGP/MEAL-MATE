import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  is_available: boolean;
  image?: string;
}

interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine_type: string;
  phone: string;
  image?: string; // cover image
  logo?: string; // new logo field
  rating?: number;
  delivery_time?: string;
  delivery_fee?: number;
}

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchMenuItems();
    }
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const response = await api.get(`/restaurants/restaurants/${id}/`);
      setRestaurant(response.data);
    } catch (error) {
      console.error('Failed to fetch restaurant:', error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await api.get(`/restaurants/menu-items/?restaurant=${id}`);
      setMenuItems(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (menuItem: MenuItem, quantity: number = 1) => {
    try {
      await api.post('/orders/cart-items/', {
        menu_item: menuItem.id,
        quantity: quantity,
        special_instructions: ''
      });
      
      setCartItems(prev => ({
        ...prev,
        [menuItem.id]: (prev[menuItem.id] || 0) + quantity
      }));

      alert('Item added to cart!');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontFamily: theme.typography.fontFamily
      }}>
        Loading restaurant details...
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
        <h2>Restaurant not found</h2>
        <Button onClick={() => navigate('/restaurants')}>
          Back to Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.colors.gray[50],
      fontFamily: theme.typography.fontFamily
    }}>
      {/* Restaurant Header */}
      <div
        style={{
          backgroundColor: theme.colors.white,
          borderBottom: `1px solid ${theme.colors.gray[200]}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: `${theme.spacing.lg} ${theme.spacing.md}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: theme.spacing.md
          }}
        >
          {/* Left Section: Back + Logo + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.lg }}>
            <Button
              variant="ghost"
              onClick={() => navigate('/restaurants')}
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.primary.main
              }}
            >
              ← Back
            </Button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.md,
              }}
            >
              {/* Logo */}
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: theme.borderRadius.full,
                  overflow: 'hidden',
                  backgroundColor: theme.colors.gray[200],
                  flexShrink: 0,
                  boxShadow: '0 0 6px rgba(0,0,0,0.1)',
                }}
              >
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo.startsWith('http')
                      ? restaurant.logo
                      : `${api.defaults.baseURL}${restaurant.logo}`}
                    alt="Restaurant Logo"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem'
                    }}
                  >
                    🍽️
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h1
                  style={{
                    fontSize: theme.typography.fontSize['3xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.gray[900],
                    marginBottom: theme.spacing.xs,
                  }}
                >
                  {restaurant.name}
                </h1>
                <p
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.gray[600],
                    marginBottom: theme.spacing.sm,
                  }}
                >
                  {restaurant.description}
                </p>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.sm,
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      backgroundColor: theme.colors.primary[50],
                      color: theme.colors.primary.main,
                      padding: '4px 8px',
                      borderRadius: theme.borderRadius.sm,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                    }}
                  >
                    {restaurant.cuisine_type}
                  </span>
                  {typeof restaurant.rating !== 'undefined' && (
                   <span
                     style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.success,
                      }}
                    >
                        ⭐ {Number(restaurant.rating).toFixed(1)}
                  </span>
                 )}
                  <span style={{ color: theme.colors.gray[500], fontSize: theme.typography.fontSize.sm }}>
                    🚚 {restaurant.delivery_time || '30-45 min'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Cart */}
          <div style={{ textAlign: 'center' }}>
            <Button
              onClick={() => navigate('/cart')}
              style={{
                padding: '10px 20px',
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              View Cart ({Object.values(cartItems).reduce((a, b) => a + b, 0)})
            </Button>
            <div
              style={{
                marginTop: theme.spacing.xs,
                color: theme.colors.gray[600],
                fontSize: theme.typography.fontSize.sm,
              }}
            >
              Delivery: ₹{restaurant.delivery_fee || 30}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing.lg,
        }}
      >
        {/* Category Filter */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xl,
            overflowX: 'auto',
            paddingBottom: theme.spacing.sm,
          }}
        >
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              style={{ whiteSpace: 'nowrap' }}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
            <h3>No menu items available</h3>
            <p style={{ color: theme.colors.gray[600] }}>
              Check back later or try a different category
            </p>
          </Card>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: theme.spacing.lg,
            }}
          >
            {filteredItems.map(item => (
              <Card key={item.id}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px',
                    gap: theme.spacing.md,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.gray[900],
                        marginBottom: theme.spacing.xs,
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      style={{
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.gray[600],
                        marginBottom: theme.spacing.sm,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: theme.typography.fontSize.lg,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.primary.main,
                        }}
                      >
                        ₹{item.price}
                      </span>
                      <Button
                        size="sm"
                        disabled={!item.is_available}
                        onClick={() => addToCart(item)}
                      >
                        {item.is_available ? 'Add' : 'Out of Stock'}
                      </Button>
                    </div>
                  </div>

                  <div
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.colors.gray[200],
                      overflow: 'hidden',
                    }}
                  >
                    {item.image ? (
                      <img
                        src={
                          item.image.startsWith('http')
                            ? item.image
                            : `${api.defaults.baseURL}${item.image}`
                        }
                        alt={item.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.8rem',
                        }}
                      >
                        🍽️
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
