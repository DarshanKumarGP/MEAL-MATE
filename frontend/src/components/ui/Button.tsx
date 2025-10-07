import React from 'react';
import { theme } from '../../styles/theme';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  style,
  disabled,
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary.main,
          color: theme.colors.white,
          border: 'none',
          ':hover': { backgroundColor: theme.colors.primary.dark }
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary.main,
          color: theme.colors.white,
          border: 'none'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.primary.main,
          border: `1px solid ${theme.colors.primary.main}`
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.colors.gray[700],
          border: 'none'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          fontSize: theme.typography.fontSize.sm,
          height: '32px'
        };
      case 'md':
        return {
          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
          fontSize: theme.typography.fontSize.base,
          height: '40px'
        };
      case 'lg':
        return {
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          fontSize: theme.typography.fontSize.lg,
          height: '48px'
        };
      default:
        return {};
    }
  };

  const baseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: theme.typography.fontFamily,
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    ...getVariantStyles(),
    ...getSizeStyles()
  };

  return (
    <button
      style={{ ...baseStyles, ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: `2px solid ${variant === 'primary' ? theme.colors.white : theme.colors.primary.main}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}
      {icon && !isLoading && icon}
      {children}
    </button>
  );
};

export default Button;
