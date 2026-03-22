import { getPercentColor } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: string;
  pct: number | null;
  icon: string;
}

const colorClasses = {
  green: {
    value: 'text-green-400',
    bar: 'bg-green-400',
    bg: 'bg-green-400/5',
  },
  orange: {
    value: 'text-yellow-400',
    bar: 'bg-yellow-400',
    bg: 'bg-yellow-400/5',
  },
  red: {
    value: 'text-red-400',
    bar: 'bg-red-400',
    bg: 'bg-red-400/5',
  },
};

export default function StatBadge({ label, value, pct, icon }: Props) {
  const color = pct !== null ? getPercentColor(pct) : 'green';
  const classes = colorClasses[color];

  return (
    <div className={cn('bg-[#1a1a35] rounded-xl p-3 border border-white/5', classes.bg)}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-xs">{icon}</span>
        <span className="text-gray-400 text-xs uppercase tracking-wider font-medium leading-none">{label}</span>
      </div>
      <p className={cn('text-2xl font-black leading-none mb-2', classes.value)}>{value}</p>
      {pct !== null && (
        <div className="w-full bg-white/10 rounded-full h-1">
          <div
            className={cn('h-1 rounded-full transition-all', classes.bar)}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
      )}
    </div>
  );
}
