import React from 'react';

const StatsCard = ({ title, value, icon, bgColor }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${bgColor} p-3 rounded-md`}>
          {icon}
        </div>
        <div className="ml-4">
          <h2 className="text-sm font-medium text-gray-500">{title}</h2>
          <p className="text-3xl font-semibold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 