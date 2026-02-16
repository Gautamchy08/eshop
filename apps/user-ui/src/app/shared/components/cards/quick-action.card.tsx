import React from 'react';

const QuickActionCard = ({ icon, title, description, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-100 hover:border-indigo-200 shadow-sm hover:shadow transition-all text-left cursor-pointer group"
    >
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center flex-shrink-0 text-indigo-600 group-hover:from-indigo-100 group-hover:to-blue-200 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
          {description}
        </p>
      </div>
    </button>
  );
};

export default QuickActionCard;
