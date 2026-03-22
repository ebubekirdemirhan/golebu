interface Props {
  teamName: string;
  scored: number[];
  conceded: number[];
}

const avg = (arr: number[]) =>
  arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '0';

export default function GoalTrend({ teamName, scored, conceded }: Props) {
  return (
    <div className="mb-1">
      <p className="text-gray-300 text-xs font-medium mb-2">{teamName}</p>

      {/* Atılan goller */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm">⚽</span>
        <div className="flex gap-1.5 flex-1">
          {scored.map((g, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold"
            >
              {g}
            </div>
          ))}
          {scored.length > 0 && (
            <span className="text-gray-500 text-xs self-center ml-1">ort. {avg(scored)}</span>
          )}
        </div>
      </div>

      {/* Yenilen goller */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm">🥅</span>
        <div className="flex gap-1.5 flex-1">
          {conceded.map((g, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold"
            >
              {g}
            </div>
          ))}
          {conceded.length > 0 && (
            <span className="text-gray-500 text-xs self-center ml-1">ort. {avg(conceded)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
