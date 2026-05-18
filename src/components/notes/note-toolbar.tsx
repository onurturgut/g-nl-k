import { Bold, CheckSquare, Image, List, Mic, Paperclip, PenLine, Table2 } from 'lucide-react';

const tools = [
  { label: 'Başlık', icon: Bold },
  { label: 'Checklist', icon: CheckSquare },
  { label: 'Liste', icon: List },
  { label: 'Görsel', icon: Image },
  { label: 'Ses', icon: Mic },
  { label: 'Dosya', icon: Paperclip },
  { label: 'Çizim', icon: PenLine },
  { label: 'Tablo', icon: Table2 },
];

export default function NoteToolbar() {
  return (
    <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-[var(--color-border)] bg-[var(--color-soft-surface)] p-1">
      {tools.map((tool) => (
        <button
          key={tool.label}
          type="button"
          title={tool.label}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-muted-text)] transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
        >
          <tool.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
