import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  count: string;
  icon: ReactNode;
  color: 'emerald' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'indigo' | 'teal' | 'amber' | 'rose';
  subtitle?: string;
}

const chip: Record<StatCardProps['color'], string> = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  teal: 'bg-teal-50 text-teal-700 ring-teal-100',
  blue: 'bg-sky-50 text-sky-700 ring-sky-100',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
  red: 'bg-rose-50 text-rose-700 ring-rose-100',
  rose: 'bg-rose-50 text-rose-700 ring-rose-100',
};

export default function StatCard({ title, value, count, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${chip[color]}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-xl sm:text-2xl font-semibold text-slate-900 tabular-nums break-words">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{subtitle || count}</p>
    </div>
  );
}
