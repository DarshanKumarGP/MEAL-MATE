import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { theme } from '../styles/theme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import { useToast } from '../context/ToastContext';
import AdvancedSearch from '../components/search/AdvancedSearch';

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
  const [appliedFilters, setAppliedFilters] = useState<any>({});
  const [pendingFilters, setPendingFilters] = useState<any>({});
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  const fetchRestaurants = useCallback(async (filters: any) => {
    try {
      setLoading(true);
      let url = '/restaurants/restaurants/';
      const params = new URLSearchParams();

      // Apply filters
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== '' && val !== undefined && val !== null) {
            params.append(key, String(val));
          }
        });
      }

      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setRestaurants(response.data.results || []);
    } catch (error) {
      console.error('Failed to fetch restaurants:', error);
      addToast('Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  // Initial fetch
  useEffect(() => {
    fetchRestaurants({});
  }, [fetchRestaurants]);

  const handleFiltersChange = (filters: any) => {
    // Just store the filters without fetching
    setPendingFilters(filters);
  };

  const handleApplyFilters = () => {
    // Apply the filters and fetch
    setAppliedFilters(pendingFilters);
    setHasActiveFilters(Object.keys(pendingFilters).some(key => pendingFilters[key] !== '' && pendingFilters[key] !== undefined && pendingFilters[key] !== null));
    fetchRestaurants(pendingFilters);
  };

  const handleClearFilters = () => {
    setPendingFilters({});
    setAppliedFilters({});
    setHasActiveFilters(false);
    fetchRestaurants({});
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
          <div style={{ marginBottom: theme.spacing.xl }}>
            <Skeleton width="100%" height="180px" />
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
            boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)',
          }}
        >
          <h1
            style={{
              fontSize: theme.typography.fontSize['4xl'],
              fontWeight: theme.typography.fontWeight.bold,
              margin: `0 0 ${theme.spacing.md} 0`,
              textShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            🍽️ Discover Great Food
          </h1>
          <p
            style={{
              fontSize: theme.typography.fontSize.lg,
              margin: 0,
              opacity: 0.95,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Order from your favorite restaurants and get it delivered fresh
          </p>
        </div>

        {/* Advanced Search Component with Apply Button */}
        <Card style={{ marginBottom: theme.spacing.xl, padding: theme.spacing.lg }}>
          <AdvancedSearch onFiltersChange={handleFiltersChange} />
          
          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.md,
              marginTop: theme.spacing.lg,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="outline"
              onClick={handleClearFilters}
              style={{
                minWidth: '140px',
                border: `2px solid ${theme.colors.gray[300]}`,
                color: theme.colors.gray[700],
                backgroundColor: 'white',
              }}
            >
              🔄 Clear Filters
            </Button>
            <Button
              onClick={handleApplyFilters}
              style={{
                minWidth: '140px',
                background: 'linear-gradient(135deg, #FF6B35 0%, #FF8F65 100%)',
                border: 'none',
                fontWeight: theme.typography.fontWeight.bold,
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              }}
            >
              🔍 Apply Filters
            </Button>
          </div>
        </Card>

        {/* Results Summary */}
        {hasActiveFilters && (
          <div
            style={{
              marginBottom: theme.spacing.lg,
              padding: theme.spacing.md,
              backgroundColor: theme.colors.primary[50],
              borderRadius: theme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: `1px solid ${theme.colors.primary[100]}`,
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
            }}
          >
            <span style={{ color: theme.colors.primary.main, fontWeight: theme.typography.fontWeight.medium }}>
              🔍 Showing {restaurants.length} result{restaurants.length !== 1 ? 's' : ''} based on your filters
            </span>
            <button
              onClick={handleClearFilters}
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.primary.main,
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                padding: '4px 8px',
              }}
            >
              ✕ Clear all
            </button>
          </div>
        )}

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
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.normal,
                  color: theme.colors.gray[500],
                }}
              >
                ({featuredRestaurants.length})
              </span>
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
            {featuredRestaurants.length > 0 ? 'More Restaurants' : 'All Restaurants'} ({regularRestaurants.length})
          </h2>

          {regularRestaurants.length === 0 && featuredRestaurants.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: theme.spacing.xxl }}>
              <div style={{ fontSize: '64px', marginBottom: theme.spacing.lg }}>🏪</div>
              <h3
                style={{
                  fontSize: theme.typography.fontSize.xl,
                  color: theme.colors.gray[700],
                  margin: `0 0 ${theme.spacing.md} 0`,
                  fontWeight: theme.typography.fontWeight.semibold,
                }}
              >
                No restaurants found
              </h3>
              <p style={{ color: theme.colors.gray[500], margin: `0 0 ${theme.spacing.lg} 0` }}>
                Try adjusting your search or filter criteria
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={handleClearFilters}
                  style={{ margin: '0 auto' }}
                >
                  Clear All Filters
                </Button>
              )}
            </Card>
          ) : regularRestaurants.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: theme.spacing.xl }}>
              <p style={{ color: theme.colors.gray[600], margin: 0 }}>
                No additional restaurants available
              </p>
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

// Restaurant Card Component
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
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
            padding: `6px 14px`,
            fontSize: theme.typography.fontSize.xs,
            fontWeight: theme.typography.fontWeight.bold,
            borderBottomLeftRadius: theme.borderRadius.md,
            zIndex: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          ⭐ Featured
        </div>
      )}

      {/* Cover Image */}
      <div
        style={{
          height: '180px',
          backgroundColor: theme.colors.gray[200],
          backgroundImage: coverImage ? `url(${coverImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {!coverImage && (
          <span style={{ fontSize: '56px', opacity: 0.5 }}>🍽️</span>
        )}

        {/* Status Overlay */}
        {!isOpen && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              backdropFilter: 'blur(2px)',
            }}
          >
            🔒 CLOSED
          </div>
        )}

        {/* Logo in corner */}
        {logoImage && (
          <div
            style={{
              position: 'absolute',
              bottom: theme.spacing.md,
              left: theme.spacing.md,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundImage: `url(${logoImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              border: '3px solid white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          />
        )}
      </div>

      {/* Restaurant Info */}
      <div style={{ padding: theme.spacing.md, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: theme.spacing.sm,
            gap: theme.spacing.sm,
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.gray[900],
              margin: 0,
              flex: 1,
              lineHeight: 1.3,
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
                padding: `4px 8px`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: theme.typography.fontWeight.bold,
                flexShrink: 0,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              ⭐ {typeof restaurant.average_rating === 'number' 
                ? restaurant.average_rating.toFixed(1) 
                : parseFloat(restaurant.average_rating).toFixed(1)}
              {restaurant.total_reviews && restaurant.total_reviews > 0 && (
                <span style={{ opacity: 0.9, fontSize: '10px' }}>({restaurant.total_reviews})</span>
              )}
            </div>
          )}
        </div>

        <p
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.gray[600],
            margin: `0 0 ${theme.spacing.md} 0`,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.5,
            flex: 1,
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
              backgroundColor: theme.colors.primary[100],
              color: theme.colors.primary.dark,
              padding: `5px 10px`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.semibold,
            }}
          >
            🍴 {restaurant.cuisine_type}
          </span>

          {restaurant.city && (
            <span
              style={{
                fontSize: theme.typography.fontSize.xs,
                color: theme.colors.gray[600],
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: theme.typography.fontWeight.medium,
              }}
            >
              📍 {restaurant.city}
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: theme.spacing.sm,
            borderTop: `1px solid ${theme.colors.gray[200]}`,
          }}
        >
          <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.gray[700] }}>
            <div style={{ fontWeight: theme.typography.fontWeight.medium, marginBottom: '2px' }}>
              🚚 ₹{restaurant.delivery_fee || 30} delivery
            </div>
            {restaurant.minimum_order && (
              <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.gray[500] }}>
                Min order: ₹{restaurant.minimum_order}
              </div>
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
              opacity: isOpen ? 1 : 0.5,
              cursor: isOpen ? 'pointer' : 'not-allowed',
              fontWeight: theme.typography.fontWeight.bold,
              padding: '8px 16px',
            }}
          >
            {isOpen ? '🛒 Order Now' : '🔒 Closed'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Helper functions
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