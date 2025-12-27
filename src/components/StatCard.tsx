import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  count: string;
  icon: ReactNode;
  color: 'emerald' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'teal' | 'amber' | 'rose';
  subtitle?: string;
}

const colorClasses = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  red: 'bg-red-50 text-red-600 border-red-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  teal: 'bg-teal-50 text-teal-600 border-teal-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
};

const gradientClasses = {
  emerald: 'from-emerald-400 to-emerald-600',
  blue: 'from-blue-400 to-blue-600', 
  green: 'from-green-400 to-green-600',
  red: 'from-red-400 to-red-600',
  purple: 'from-purple-400 to-purple-600',
  orange: 'from-orange-400 to-orange-600',
  indigo: 'from-indigo-400 to-indigo-600',
  teal: 'from-teal-400 to-teal-600',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
};

export default function StatCard({ title, value, count, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-100/60 p-3 sm:p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 min-h-[120px] sm:min-h-[140px] lg:min-h-[160px]">
      <div className="flex items-start justify-between mb-2 sm:mb-3 lg:mb-4 h-full">
        <div className="flex-1 flex flex-col justify-between h-full">
          <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradientClasses[color]} flex items-center justify-center shadow-md flex-shrink-0`}>
              <div className="text-white text-sm sm:text-base lg:text-lg">
                {icon}
              </div>
            </div>
            <div className="h-6 sm:h-8 w-px bg-gradient-to-b from-gray-200 to-transparent hidden sm:block" />
          </div>
          <div className="flex-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 tracking-wide line-clamp-1">{title}</p>
            <p className="text-sm sm:text-lg lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight line-clamp-1">{value}</p>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-gradient-to-r ${gradientClasses[color]} flex-shrink-0`} />
              <p className="text-xs text-gray-500 font-medium line-clamp-1">{subtitle || count}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}