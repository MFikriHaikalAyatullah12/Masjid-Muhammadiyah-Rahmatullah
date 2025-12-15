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
  emerald: 'bg-emerald-50 text-emerald-600',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
  indigo: 'bg-indigo-50 text-indigo-600',
};

export default function StatCard({ title, value, count, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="card p-5 hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subtitle || count}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}