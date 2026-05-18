import { Search, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="flex h-11 items-center gap-2 rounded-full border border-transparent bg-[var(--color-soft-surface)] px-4 text-[var(--color-muted-text)] transition-all focus-within:border-[var(--color-primary)]/35 focus-within:bg-[var(--color-surface)] focus-within:shadow-soft">
      <Search className="h-4 w-4" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Notlarda ara..."
        className="min-w-0 flex-1 bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted-text)]"
      />
      <SlidersHorizontal className="h-4 w-4" />
    </label>
  );
}
