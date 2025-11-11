import React from 'react';

const StatsSection = () => {
  const stats = [
    { value: '12,500+', label: 'Complaints Resolved' },
    { value: '95%', label: 'Citizen Satisfaction' },
    { value: '48 Hours', label: 'Avg. Resolution Time' },
  ];

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <p className="text-4xl font-extrabold text-slate-800">{stat.value}</p>
              <p className="mt-2 text-lg font-medium text-slate-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;