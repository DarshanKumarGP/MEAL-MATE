import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';

interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine_type: string;
  phone: string;
  email: string;
  logo?: string;
  cover_image?: string;
  average_rating?: number;
  total_reviews?: number;
  delivery_fee?: number;
  minimum_order?: number;
  opening_time?: string;
  closing_time?: string;
  status: string;
  is_featured: boolean;
  address_line_1?: string;
  city?: string;
  state?: string;
}

const RestaurantList: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  const cuisineTypes = ['All', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'American', 'Continental', 'Fast Food'];

  useEffect(() => {
    fetchRestaurants();
  }, [searchTerm, selectedCuisine]);

  const fetchRestaurants = async () => {
    try {
      let url = '/restaurants/restaurants/';
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCuisine && selectedCuisine !== 'All') params.append('cuisine_type', selectedCuisine);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setRestaurants(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      addToast('Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000/media/${imagePath}`;
  };

  const isRestaurantOpen = (openTime?: string, closeTime?: string) => {
    if (!openTime || !closeTime) return true;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    return currentTime >= openMinutes && currentTime <= closeMinutes;
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: theme.colors.gray[50],
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: theme.spacing.lg,
          }}
        >
          {/* Skeleton Header */}
          <div style={{ textAlign: 'center', marginBottom: theme.spacing.xl }}>
            <div style={{ margin: '0 auto 16px auto', display: 'inline-block' }}>
              <Skeleton width="300px" height="40px" />
            </div>
            <div style={{ margin: '0 auto', display: 'inline-block' }}>
              <Skeleton width="400px" height="20px" />
            </div>
          </div>

          {/* Skeleton Filters */}
          <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
            <Skeleton width="300px" height="45px" />
            <Skeleton width="150px" height="45px" />
          </div>

          {/* Skeleton Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: theme.spacing.lg,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Card key={i} style={{ overflow: 'hidden' }}>
                <Skeleton width="100%" height="160px" />
                <div style={{ padding: theme.spacing.md }}>
                  <div style={{ marginBottom: 8 }}>
                    <Skeleton width="70%" height="20px" />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Skeleton width="100%" height="14px" />
                  </div>
                  <Skeleton width="40%" height="12px" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featuredRestaurants = restaurants.filter((r) => r.is_featured && r.status === 'ACTIVE');
  const regularRestaurants = restaurants.filter((r) => !r.is_featured && r.status === 'ACTIVE');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.gray[50],
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: theme.spacing.lg,
        }}
      >
        {/* Modern Header */}
        <div
          style={{
            marginBottom: theme.spacing.xxl,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
            padding: theme.spacing.xl,
            borderRadius: theme.borderRadius.xl,
            color: 'white',
          }}
        >
          <h1
            style={{
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.bold,
              margin: `0 0 ${theme.spacing.md} 0`,
            }}
          >
            🍽️ Discover Great Food
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              margin: 0,
              opacity: 0.9,
            }}
          >
            Order from your favorite restaurants and get it delivered fresh
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.lg,
            backgroundColor: 'white',
            borderRadius: theme.borderRadius.lg,
            boxShadow: theme.shadows.sm,
          }}
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 50px`,
                border: `2px solid ${theme.colors.gray[200]}`,
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.fontSize.base,
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = theme.colors.primary.main)}
              onBlur={(e) => (e.target.style.borderColor = theme.colors.gray[200])}
            />
            <span
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
              }}
            >
              🔍
            </span>
          </div>

          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            style={{
              padding: theme.spacing.md,
              border: `2px solid ${theme.colors.gray[200]}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.base,
              minWidth: '150px',
              outline: 'none',
            }}
          >
            {cuisineTypes.map((cuisine) => (
              <option key={cuisine} value={cuisine === 'All' ? '' : cuisine}>
                {cuisine}
              </option>
            ))}
          </select>
        </div>

        {/* Featured Restaurants */}
        {featuredRestaurants.length > 0 && (
          <div style={{ marginBottom: theme.spacing.xxl }}>
            <h2
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.gray[900],
                margin: `0 0 ${theme.spacing.lg} 0`,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
              }}
            >
              ⭐ Featured Restaurants
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: theme.spacing.lg,
              }}
            >
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} navigate={navigate} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Restaurants */}
        <div>
          <h2
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              margin: `0 0 ${theme.spacing.lg} 0`,
            }}
          >
            All Restaurants ({regularRestaurants.length})
          </h2>

          {regularRestaurants.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
              <div style={{ fontSize: '48px', marginBottom: theme.spacing.lg }}>🏪</div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  color: theme.colors.gray[700],
                  margin: `0 0 ${theme.spacing.md} 0`,
                }}
              >
                No restaurants found
              </h3>
              <p style={{ color: theme.colors.gray[500], margin: 0 }}>Try adjusting your search or filter criteria</p>
            </Card>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: theme.spacing.lg,
              }}
            >
              {regularRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} navigate={navigate} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted Restaurant Card Component
const RestaurantCard: React.FC<{
  restaurant: Restaurant;
  navigate: (path: string) => void;
  featured?: boolean;
}> = ({ restaurant, navigate, featured = false }) => {
  const isOpen = isRestaurantOpen(restaurant.opening_time, restaurant.closing_time);
  const coverImage = getImageUrl(restaurant.cover_image);
  const logoImage = getImageUrl(restaurant.logo);

  return (
    <Card
      hover
      style={{
        cursor: 'pointer',
        overflow: 'hidden',
        border: featured ? `2px solid ${theme.colors.primary.main}` : undefined,
        position: 'relative',
      }}
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
    >
      {featured && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: theme.colors.primary.main,
            color: 'white',
            padding: `4px 12px`,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.bold,
            borderBottomLeftRadius: theme.borderRadius.md,
            zIndex: 1,
          }}
        >
          FEATURED
        </div>
      )}

      {/* Cover Image */}
      <div
        style={{
          height: '160px',
          backgroundColor: theme.colors.gray[200],
          backgroundImage: coverImage ? `url(${coverImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {!coverImage && <span style={{ fontSize: '48px' }}>🍽️</span>}

        {/* Status Overlay */}
        {!isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            CLOSED
          </div>
        )}

        {/* Logo in corner */}
        {logoImage && (
          <div
            style={{
              position: 'absolute',
              bottom: theme.spacing.sm,
              left: theme.spacing.sm,
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundImage: `url(${logoImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '2px solid white',
              boxShadow: theme.shadows.sm,
            }}
          />
        )}
      </div>

      {/* Restaurant Info */}
      <div style={{ padding: theme.spacing.md }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.sm,
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.gray[900],
              margin: 0,
              flex: 1,
            }}
          >
            {restaurant.name}
          </h3>

          {restaurant.average_rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: theme.colors.success,
                color: 'white',
                padding: `2px 6px`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.medium,
                marginLeft: theme.spacing.sm,
              }}
            >
              ⭐ {restaurant.average_rating}
              {restaurant.total_reviews && <span style={{ opacity: 0.8 }}>({restaurant.total_reviews})</span>}
            </div>
          )}
        </div>

        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.gray[600],
            margin: `0 0 ${theme.spacing.sm} 0`,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.4,
          }}
        >
          {restaurant.description}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.md,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              backgroundColor: theme.colors.primary[50],
              color: theme.colors.primary.main,
              padding: `4px 8px`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            {restaurant.cuisine_type}
          </span>

          <span
            style={{
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.gray[500],
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            📍 {restaurant.city || 'Unknown'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[600] }}>
            <div>🚚 ₹{restaurant.delivery_fee || 30} delivery</div>
            {restaurant.minimum_order && (
              <div style={{ fontSize: theme.typography.fontSize.xs }}>Min: ₹{restaurant.minimum_order}</div>
            )}
          </div>

          <Button
            size="sm"
            disabled={!isOpen}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/restaurants/${restaurant.id}`);
            }}
            style={{
              opacity: isOpen ? 1 : 0.6,
            }}
          >
            {isOpen ? 'Order Now' : 'Closed'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Helper functions (moved outside)
const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  return imagePath.startsWith('http') ? imagePath : `http://127.0.0.1:8000/media/${imagePath}`;
};

const isRestaurantOpen = (openTime?: string, closeTime?: string) => {
  if (!openTime || !closeTime) return true;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;
  return currentTime >= openMinutes && currentTime <= closeMinutes;
};

export default RestaurantList;
