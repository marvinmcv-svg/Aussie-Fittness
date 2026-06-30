'use client';

import { cn } from '@/lib/utils';

interface MacroBarProps {
  protein: number;
  carbs: number;
  fats: number;
  calories: number;
  label?: string;
}

// Macro calorie contributions: protein 4 cal/g, carbs 4 cal/g, fats 9 cal/g
export function MacroBar({ protein, carbs, fats, label }: MacroBarProps) {
  const proteinCal = protein * 4;
  const carbsCal = carbs * 4;
  const fatsCal = fats * 9;
  const total = proteinCal + carbsCal + fatsCal || 1;

  return (
    <div className="w-full">
      {label && <div className="mb-1 text-xs text-muted-foreground">{label}</div>}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="bg-protein transition-all"
          style={{ width: `${(proteinCal / total) * 100}%` }}
          title={`Protein ${protein}g (${Math.round((proteinCal / total) * 100)}%)`}
        />
        <div
          className="bg-carbs transition-all"
          style={{ width: `${(carbsCal / total) * 100}%` }}
          title={`Carbs ${carbs}g (${Math.round((carbsCal / total) * 100)}%)`}
        />
        <div
          className="bg-fats transition-all"
          style={{ width: `${(fatsCal / total) * 100}%` }}
          title={`Fats ${fats}g (${Math.round((fatsCal / total) * 100)}%)`}
        />
      </div>
    </div>
  );
}

interface MacroRingProps {
  label: string;
  value: number;
  unit: string;
  color: 'protein' | 'carbs' | 'fats' | 'calories';
  max?: number;
}

export function MacroRing({ label, value, unit, color, max }: MacroRingProps) {
  const pct = max ? Math.min(100, (value / max) * 100) : 100;
  const colorClass = {
    protein: 'text-protein',
    carbs: 'text-carbs',
    fats: 'text-fats',
    calories: 'text-calories',
  }[color];
  const strokeClass = {
    protein: 'stroke-protein',
    carbs: 'stroke-carbs',
    fats: 'stroke-fats',
    calories: 'stroke-calories',
  }[color];

  const r = 28;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-20 w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r={r}
            className="fill-none stroke-muted"
            strokeWidth="5"
          />
          <circle
            cx="32"
            cy="32"
            r={r}
            className={cn('fill-none transition-all duration-500', strokeClass)}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - (pct / 100) * circ}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-base font-bold', colorClass)}>{value}</span>
          <span className="text-[9px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
