import React from 'react';
import { useToast } from '../../context/ToastContext';
import { theme } from '../../styles/theme';

const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, display: 'flex',
      flexDirection: 'column', gap: theme.spacing.sm, zIndex: 2000
    }}>
      {toasts.map(({ id, message, type }) => (
        <div key={id} style={{
          minWidth: 250,
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.md,
          backgroundColor: type === 'success' ? theme.colors.success : theme.colors.error,
          color: theme.colors.white,
          boxShadow: theme.shadows.md,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{message}</span>
          <button onClick={() => removeToast(id)} style={{
            background: 'transparent',
            border: 'none',
            color: theme.colors.white,
            fontSize: '16px',
            cursor: 'pointer'
          }}>×</button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
