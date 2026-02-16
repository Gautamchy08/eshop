import React from 'react';

const StatCard = ({ title, count, icon }: any) => {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center text-indigo-600">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{count}</p>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {title}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
