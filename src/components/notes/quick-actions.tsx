import { Camera, CheckSquare, FileScan, Mic, Palette, Plus, Tag } from 'lucide-react';

const actions = [
  { label: 'Hızlı Not', icon: Plus },
  { label: 'Sesli Not', icon: Mic },
  { label: 'Kamera ile Ekle', icon: Camera },
  { label: 'Belge Tara', icon: FileScan },
  { label: 'Checklist', icon: CheckSquare },
  { label: 'Çizim Yap', icon: Palette },
  { label: 'Etiket Ekle', icon: Tag },
];

interface QuickActionsProps {
  onQuickNote: () => void;
}

export default function QuickActions({ onQuickNote }: QuickActionsProps) {
  return (
    <div className="fixed bottom-24 right-4 z-30 flex flex-col items-end gap-2 lg:bottom-6">
      <div className="hidden rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)]/86 p-2 shadow-elevated backdrop-blur-xl md:grid md:grid-cols-2 md:gap-1">
        {actions.slice(1).map((action) => (
          <button
            key={action.label}
            type="button"
            className="flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold text-[var(--color-muted-text)] transition-colors hover:bg-[var(--color-soft-surface)] hover:text-[var(--color-text)]"
          >
            <action.icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        ))}
      </div>
      <button
        onClick={onQuickNote}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-elevated transition-all hover:scale-105"
        aria-label="Hızlı not"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
