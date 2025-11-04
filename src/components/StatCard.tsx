import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  count: string;
  icon: ReactNode;
  color: 'emerald' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo';
  subtitle?: string;
}

const colorClasses = {
  emerald: 'bg-emerald-100 text-emerald-600',
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  indigo: 'bg-indigo-100 text-indigo-600',
};

export default function StatCard({ title, value, count, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2 md:p-3 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          {icon}
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
        <p className="text-lg md:text-2xl font-bold text-gray-900 mb-1 break-words">{value}</p>
        <p className="text-xs md:text-sm text-gray-500 truncate">{subtitle || count}</p>
      </div>
    </div>
  );
}