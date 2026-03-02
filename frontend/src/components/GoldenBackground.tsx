import React from 'react';

const GoldenBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 pointer-events-none" 
      style={{ 
        zIndex: -1,
        background: 'radial-gradient(ellipse at top, rgba(197, 160, 101, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(197, 160, 101, 0.1) 0%, transparent 50%)'
      }} 
    />
  );
};

export default GoldenBackground;
