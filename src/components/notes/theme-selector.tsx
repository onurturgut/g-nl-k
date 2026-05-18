import { Moon, Sun, Waves, Flower, ScrollText } from 'lucide-react';

const noteThemes = [
  { label: 'Açık', icon: Sun },
  { label: 'Koyu', icon: Moon },
  { label: 'Sepya', icon: ScrollText },
  { label: 'Okyanus', icon: Waves },
  { label: 'Lavanta', icon: Flower },
];

export default function NotesThemeSelector() {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full border border-[var(--color-border)] bg-[var(--color-soft-surface)] p-1">
      {noteThemes.map((theme, index) => (
        <button
          key={theme.label}
          type="button"
          className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
            index === 0
              ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-soft'
              : 'text-[var(--color-muted-text)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]'
          }`}
        >
          <theme.icon className="h-3.5 w-3.5" />
          {theme.label}
        </button>
      ))}
    </div>
  );
}
