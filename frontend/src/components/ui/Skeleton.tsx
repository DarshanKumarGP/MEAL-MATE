import React from 'react';

const Skeleton: React.FC<{ width?: string; height?: string }> = ({ width = '100%', height = '1em' }) => (
  <div style={{
    width, height,
    backgroundColor: '#eee',
    borderRadius: 4,
    animation: 'pulse 1.5s ease-in-out infinite'
  }} />
);

export default Skeleton;

// Add global CSS in App.tsx
<style>{`
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.4; }
    100% { opacity: 1; }
  }
`}</style>
