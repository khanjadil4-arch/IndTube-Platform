import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  icon?: LucideIcon;
  onSeeAll?: () => void;
}

export default function SectionHeader({ title, icon: Icon, onSeeAll }: Props) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-ink-800 flex items-center justify-center">
            <Icon className="w-4 h-4 text-brand-400" />
          </div>
        )}
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
        >
          See All
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
