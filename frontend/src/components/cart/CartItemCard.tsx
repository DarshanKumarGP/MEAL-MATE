import React from 'react';

interface CartItemCardProps {
  id: number;
  name: string;
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
  updating: boolean;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  name,
  unitPrice,
  quantity,
  specialInstructions,
  onIncrease,
  onDecrease,
  onRemove,
  updating,
}) => {
  return (
    <div 
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255, 107, 53, 0.08)',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.12)';
        e.currentTarget.style.transform = 'translateY(-4px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr auto',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Item Image */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #FFE8DD 0%, #FFF5F0 100%)',
          position: 'relative',
          boxShadow: '0 4px 16px rgba(255, 107, 53, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px'
        }}>
          🍕
        </div>

        {/* Item Details */}
        <div style={{ minWidth: 0 }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 8px 0',
            lineHeight: 1.3
          }}>
            {name}
          </h3>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <span style={{
              background: '#F0F8FF',
              color: '#2563EB',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Popular
            </span>
            <div style={{
              width: '16px',
              height: '16px',
              background: '#22C55E',
              borderRadius: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px'
            }}>
              🟢
            </div>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '8px 0 12px 0',
            lineHeight: 1.5
          }}>
            Delicious and freshly prepared with premium ingredients. Perfect for any meal!
          </p>

          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#FF6B35',
            margin: '12px 0 8px 0'
          }}>
            ₹{unitPrice.toFixed(2)} each
          </div>

          {specialInstructions && specialInstructions.trim() && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#FEF3E2',
              borderRadius: '8px',
              border: '1px solid #FDE68A'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#92400E',
                margin: 0,
                fontWeight: '500',
                lineHeight: 1.4
              }}>
                <span style={{ marginRight: '6px' }}>📝</span>
                Special Instructions: {specialInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Quantity & Price Controls */}
        <div style={{ 
          textAlign: 'right',
          minWidth: '140px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FF6B35',
            marginBottom: '16px'
          }}>
            ₹{(unitPrice * quantity).toFixed(2)}
          </div>
          
          {/* Quantity Controls */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: '#F8FAFC',
            borderRadius: '12px',
            padding: '8px 12px',
            border: '2px solid #E2E8F0',
            marginBottom: '12px'
          }}>
            <button
              onClick={onDecrease}
              disabled={updating}
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: '700',
                color: '#FF6B35',
                cursor: updating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: updating ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!updating) {
                  e.currentTarget.style.background = '#FFE8DD';
                  e.currentTarget.style.borderColor = '#FF6B35';
                }
              }}
              onMouseOut={(e) => {
                if (!updating) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              −
            </button>
            <span style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#333',
              minWidth: '24px',
              textAlign: 'center'
            }}>
              {updating ? '...' : quantity}
            </span>
            <button
              onClick={onIncrease}
              disabled={updating}
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                fontSize: '20px',
                fontWeight: '700',
                color: '#FF6B35',
                cursor: updating ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                opacity: updating ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!updating) {
                  e.currentTarget.style.background = '#FFE8DD';
                  e.currentTarget.style.borderColor = '#FF6B35';
                }
              }}
              onMouseOut={(e) => {
                if (!updating) {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }
              }}
            >
              +
            </button>
          </div>
          
          <button
            onClick={onRemove}
            disabled={updating}
            style={{
              background: updating ? '#FEE2E2' : '#FEF2F2',
              border: `1px solid ${updating ? '#FECACA' : '#FDE2E2'}`,
              color: updating ? '#DC2626' : '#EF4444',
              fontSize: '12px',
              fontWeight: '600',
              cursor: updating ? 'not-allowed' : 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              if (!updating) {
                e.currentTarget.style.background = '#FEE2E2';
                e.currentTarget.style.borderColor = '#FECACA';
              }
            }}
            onMouseOut={(e) => {
              if (!updating) {
                e.currentTarget.style.background = '#FEF2F2';
                e.currentTarget.style.borderColor = '#FDE2E2';
              }
            }}
          >
            {updating ? (
              <>⏳ Removing...</>
            ) : (
              <>🗑️ Remove</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
