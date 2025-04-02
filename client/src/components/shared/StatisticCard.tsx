import React from 'react';

interface MetricInfo {
  label: string;
  value: string;
}

interface StatisticCardProps {
  title: string;
  value: string;
  metrics: MetricInfo[];
  bgColor: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ title, value, metrics, bgColor }) => {
  return (
    <div className={`bg-gradient-to-br ${bgColor} rounded-xl shadow-md p-6 text-white flex flex-col justify-between h-full`}>
      <div className="mb-2">
        <h3 className="text-lg font-medium opacity-80">{title}</h3>
        <div className="text-3xl font-bold mt-1">{value}</div>
      </div>
      <div className="flex justify-between mt-4">
        {metrics.map((metric, index) => (
          <div key={index}>
            <div className="text-sm opacity-80">{metric.label}</div>
            <div className="text-xl font-semibold">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticCard;
