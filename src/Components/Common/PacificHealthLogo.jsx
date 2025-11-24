import React from 'react';

const PacificHealthLogo = ({ className = "h-20 w-auto" }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="flex items-center space-x-3 mb-2">
        {/* Logo Symbol - Circular with medical cross */}
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-blue-700 rounded-full flex items-center justify-center border-4 border-blue-900">
          <div className="text-white font-bold text-lg">⚕</div>
        </div>
        
        {/* Main Text */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-900">
            PACIFIC <span className="text-red-500">HEALTH</span> <span className="text-blue-700">SYSTEMS</span>
          </div>
        </div>
      </div>
      
      {/* Subtitle */}
      <div className="text-sm font-medium text-blue-700 tracking-wider">
        PRIVATE HOMECARE SERVICES
      </div>
    </div>
  );
};

export default PacificHealthLogo;
