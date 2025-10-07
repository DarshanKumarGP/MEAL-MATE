import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { theme } from '../styles/theme';
import Button from '../components/ui/Button';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to restaurants
  React.useEffect(() => {
    if (user) {
      navigate('/restaurants');
    }
  }, [user, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FF6B35 0%, #E55722 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: theme.typography.fontFamily
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: theme.spacing.lg,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: theme.spacing.xxl,
        alignItems: 'center'
      }}>
        {/* Left Side - Hero Content */}
        <div>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.white,
            margin: '0 0 24px 0',
            lineHeight: '1.1'
          }}>
            🍽️ MEAL-MATE
          </h1>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.white,
            margin: '0 0 16px 0',
            opacity: 0.9
          }}>
            Food Delivered Fast
          </h2>
          <p style={{
            fontSize: theme.typography.fontSize.xl,
            color: theme.colors.white,
            margin: '0 0 40px 0',
            opacity: 0.8,
            lineHeight: '1.6'
          }}>
            Order from your favorite restaurants and get fresh, hot food delivered to your doorstep in minutes.
          </p>
          
          <div style={{ display: 'flex', gap: theme.spacing.md }}>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
              style={{
                backgroundColor: theme.colors.white,
                color: theme.colors.primary.main,
                padding: '16px 32px',
                fontSize: theme.typography.fontSize.lg
              }}
            >
              Login
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/register')}
              style={{
                borderColor: theme.colors.white,
                color: theme.colors.white,
                padding: '16px 32px',
                fontSize: theme.typography.fontSize.lg
              }}
            >
              Sign Up
            </Button>
          </div>
        </div>

        {/* Right Side - Features */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xxl,
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{
            fontSize: theme.typography.fontSize['2xl'],
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.white,
            margin: '0 0 32px 0'
          }}>
            Why Choose MEAL-MATE?
          </h3>
          
          {[
            { icon: '🚀', title: 'Fast Delivery', desc: '30 min average delivery time' },
            { icon: '🍕', title: 'Best Restaurants', desc: 'Curated selection of top restaurants' },
            { icon: '💳', title: 'Easy Payment', desc: 'Multiple payment options available' },
            { icon: '📱', title: 'Live Tracking', desc: 'Track your order in real-time' }
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.md,
              marginBottom: theme.spacing.lg
            }}>
              <div style={{
                fontSize: '2rem',
                width: '60px',
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: theme.borderRadius.md
              }}>
                {feature.icon}
              </div>
              <div>
                <h4 style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.white,
                  margin: '0 0 4px 0'
                }}>
                  {feature.title}
                </h4>
                <p style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.white,
                  opacity: 0.8,
                  margin: 0
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Landing;
