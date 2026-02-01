import React from 'react';

const GoldenBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg className="absolute w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="golden-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="60" y2="60" stroke="#C5A065" strokeWidth="0.5"/>
            <line x1="60" y1="0" x2="0" y2="60" stroke="#C5A065" strokeWidth="0.5"/>
            <circle cx="30" cy="30" r="1.5" fill="#C5A065"/>
            <line x1="0" y1="30" x2="60" y2="30" stroke="#C5A065" strokeWidth="0.25" opacity="0.5"/>
            <line x1="30" y1="0" x2="30" y2="60" stroke="#C5A065" strokeWidth="0.25" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#golden-lines)"/>
      </svg>
    </div>
  );
};

export default GoldenBackground;