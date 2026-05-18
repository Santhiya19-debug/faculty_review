import { cn } from "@/lib/utils";

interface RatingBarProps {
  label: string;
  emoji: string;
  value: number;
  max?: number;
  size?: "sm" | "md";
}

export default function RatingBar({ label, emoji, value, max = 10, size = "md" }: RatingBarProps) {
  const percent = (value / max) * 100;
  const color = value >= 7 ? "bg-emerald-400" : value >= 5 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="flex items-center gap-3">
      <span className="text-base shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className={cn("font-medium text-gray-600 truncate", size === "sm" ? "text-xs" : "text-xs sm:text-sm")}>
            {label}
          </span>
          <span className={cn("font-bold text-gray-700 shrink-0 ml-2", size === "sm" ? "text-xs" : "text-sm")}>
            {value.toFixed(1)}
          </span>
        </div>
        <div className="w-full bg-rose-100 rounded-full overflow-hidden" style={{ height: size === "sm" ? 4 : 6 }}>
          <div
            className={cn("h-full rounded-full transition-all duration-500", color)}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
