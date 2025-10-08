import React, { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import Card from '../ui/Card';
import Button from '../ui/Button';


interface SearchFilters {
  search: string;
  cuisine_type: string;
  city: string;
  min_rating: string;
  max_rating: string;
  min_delivery_fee: string;
  max_delivery_fee: string;
  is_featured: boolean;
  ordering: string;
}


interface AdvancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}


const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onFiltersChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState<SearchFilters>({
    search: '',
    cuisine_type: '',
    city: '',
    min_rating: '',
    max_rating: '',
    min_delivery_fee: '',
    max_delivery_fee: '',
    is_featured: false,
    ordering: '-average_rating',
    ...initialFilters
  });


  const [showAdvanced, setShowAdvanced] = useState(false);


  const cuisineTypes = ['All', 'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'American', 'Continental', 'Fast Food'];
  const cities = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];
  const sortOptions = [
    { value: '-average_rating', label: 'Rating (High to Low)' },
    { value: 'average_rating', label: 'Rating (Low to High)' },
    { value: 'delivery_fee', label: 'Delivery Fee (Low to High)' },
    { value: '-delivery_fee', label: 'Delivery Fee (High to Low)' },
    { value: '-created_at', label: 'Newest First' },
    { value: '-total_orders', label: 'Most Popular' }
  ];


  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };


  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      search: '',
      cuisine_type: '',
      city: '',
      min_rating: '',
      max_rating: '',
      min_delivery_fee: '',
      max_delivery_fee: '',
      is_featured: false,
      ordering: '-average_rating'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };


  return (
    <Card style={{ marginBottom: theme.spacing.lg }}>
      {/* Main Search Bar */}
      <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search restaurants, cuisines, or dishes..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            style={{
              width: '100%',
              padding: `${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} 50px`,
              border: `2px solid ${theme.colors.gray[200]}`,
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.base,
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.colors.primary.main;
              e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary[50]}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.colors.gray[200];
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '18px',
            color: theme.colors.gray[400]
          }}>🔍</span>
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ whiteSpace: 'nowrap' }}
        >
          {showAdvanced ? '🔽 Less' : '🔧 Filters'}
        </Button>
        
      </div>


      {/* Quick Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: theme.spacing.md,
        marginBottom: showAdvanced ? theme.spacing.lg : 0
      }}>
        <select
          value={filters.cuisine_type}
          onChange={(e) => updateFilter('cuisine_type', e.target.value)}
          style={{
            padding: theme.spacing.sm,
            border: `2px solid ${theme.colors.gray[200]}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm
          }}
        >
          {cuisineTypes.map(cuisine => (
            <option key={cuisine} value={cuisine === 'All' ? '' : cuisine}>
              {cuisine} Cuisine
            </option>
          ))}
        </select>


        <select
          value={filters.city}
          onChange={(e) => updateFilter('city', e.target.value)}
          style={{
            padding: theme.spacing.sm,
            border: `2px solid ${theme.colors.gray[200]}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm
          }}
        >
          {cities.map(city => (
            <option key={city} value={city === 'All' ? '' : city}>
              📍 {city}
            </option>
          ))}
        </select>


        <select
          value={filters.ordering}
          onChange={(e) => updateFilter('ordering', e.target.value)}
          style={{
            padding: theme.spacing.sm,
            border: `2px solid ${theme.colors.gray[200]}`,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.sm
          }}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              🔄 {option.label}
            </option>
          ))}
        </select>
      </div>


      {/* Advanced Filters */}
      {showAdvanced && (
        <div style={{
          borderTop: `1px solid ${theme.colors.gray[200]}`,
          paddingTop: theme.spacing.lg,
          animation: 'slideDown 0.3s ease'
        }}>
          <h4 style={{
            margin: `0 0 ${theme.spacing.md} 0`,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium,
            color: theme.colors.gray[800]
          }}>
            Advanced Filters
          </h4>


          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.lg
          }}>
            {/* Rating Filter */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.gray[700]
              }}>
                ⭐ Rating Range
              </label>
              <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  min="1"
                  max="5"
                  step="0.1"
                  value={filters.min_rating}
                  onChange={(e) => updateFilter('min_rating', e.target.value)}
                  style={{
                    flex: 1,
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="1"
                  max="5"
                  step="0.1"
                  value={filters.max_rating}
                  onChange={(e) => updateFilter('max_rating', e.target.value)}
                  style={{
                    flex: 1,
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
              </div>
            </div>


            {/* Delivery Fee Filter */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.gray[700]
              }}>
                🚚 Delivery Fee (₹)
              </label>
              <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  min="0"
                  value={filters.min_delivery_fee}
                  onChange={(e) => updateFilter('min_delivery_fee', e.target.value)}
                  style={{
                    flex: 1,
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
                <span>to</span>
                <input
                  type="number"
                  placeholder="Max"
                  min="0"
                  value={filters.max_delivery_fee}
                  onChange={(e) => updateFilter('max_delivery_fee', e.target.value)}
                  style={{
                    flex: 1,
                    padding: theme.spacing.sm,
                    border: `1px solid ${theme.colors.gray[300]}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.fontSize.sm
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}


      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Card>
  );
};


export default AdvancedSearch;
