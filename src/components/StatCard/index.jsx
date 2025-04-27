import React from "react";

function StatCard({ title, stats, progress }) {
  // Định nghĩa màu nếu không dùng Tailwind
  const progressColor = progress?.color === 'bg-green-500' ? '#52C41A' : '#F5222D';

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      {stats.map((stat, index) => (
        <p key={index} className="text-sm text-gray-500 mt-1">
          {stat.label}: {stat.value}
        </p>
      ))}
      {progress && (
        <div className="mt-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 rounded-full"
              style={{ 
                width: `${progress.value}%`, 
                backgroundColor: progressColor 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatCard;