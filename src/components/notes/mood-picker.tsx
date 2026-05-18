import type { QuickNote } from '@/store/usePlannerStore';

export const moods: { id: NonNullable<QuickNote['mood']>; label: string }[] = [
  { id: 'happy', label: '😊' },
  { id: 'rocket', label: '🚀' },
  { id: 'sleepy', label: '😴' },
  { id: 'calm', label: '😌' },
  { id: 'angry', label: '😡' },
];

interface MoodPickerProps {
  value?: QuickNote['mood'];
  onChange: (mood: NonNullable<QuickNote['mood']>) => void;
}

export default function MoodPicker({ value = 'calm', onChange }: MoodPickerProps) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-soft-surface)] p-1">
      {moods.map((mood) => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onChange(mood.id)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-base transition-all ${
            value === mood.id ? 'bg-[var(--color-surface)] shadow-soft scale-105' : 'opacity-60 hover:opacity-100'
          }`}
        >
          {mood.label}
        </button>
      ))}
    </div>
  );
}
