'use client';

interface Stats {
  totalMatches: number;
  winnerSuccess: number;
  over25Success: number;
  bttsSuccess: number;
  hy05Success: number;
}

interface Props {
  stats: Stats;
}

const statItems = [
  { key: 'totalMatches' as const, label: 'Toplam Sonuç', color: 'text-purple-400', suffix: '' },
  { key: 'winnerSuccess' as const, label: '1X2 Başarı', color: 'text-green-400', suffix: '%' },
  { key: 'over25Success' as const, label: '2.5 Üst/Alt', color: 'text-orange-400', suffix: '%' },
  { key: 'bttsSuccess' as const, label: 'KG Var/Yok', color: 'text-blue-400', suffix: '%' },
  { key: 'hy05Success' as const, label: 'İY 0.5 Üst', color: 'text-pink-400', suffix: '%' },
];

export default function StatsOverview({ stats }: Props) {
  return (
    <div className="bg-[#13132a] border border-white/5 rounded-2xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-400">🏆</span>
        <span className="text-white font-bold text-sm">Genel Özet</span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {statItems.map(({ key, label, color, suffix }) => (
          <div key={key} className="bg-[#1a1a35] rounded-xl p-3 text-center">
            <p className={`text-2xl font-black ${color} leading-none mb-1`}>
              {stats[key]}{suffix}
            </p>
            <p className="text-gray-500 text-[10px] leading-tight">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
