import React, { useState } from 'react';
import { theme } from '../../styles/theme';

interface CardProps {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
  shadow?: keyof typeof theme.shadows;
  hover?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  padding = 'lg',
  shadow = 'md',
  hover = false,
  style,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyles: React.CSSProperties = {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.gray[200]}`,
    boxShadow: isHovered && hover ? theme.shadows.lg : theme.shadows[shadow],
    padding: theme.spacing[padding],
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease-in-out',
    ...(isHovered && hover
      ? { transform: 'translateY(-2px)' }
      : {}),
    ...style
  };

  return (
    <div
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

export default Card;
