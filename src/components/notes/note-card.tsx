import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { CheckSquare, FileText, Lightbulb, Pin, Sparkles, Trash2, Users } from 'lucide-react';
import { moods } from '@/components/notes/mood-picker';
import type { QuickNote } from '@/store/usePlannerStore';

const typeIcons = {
  daily: FileText,
  idea: Lightbulb,
  meeting: Users,
  checklist: CheckSquare,
  shopping: CheckSquare,
  'ai-summary': Sparkles,
  personal: FileText,
  work: FileText,
};

interface NoteCardProps {
  note: QuickNote;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export default function NoteCard({ note, active, onSelect, onDelete }: NoteCardProps) {
  const Icon = typeIcons[note.type || 'idea'];
  const mood = moods.find((item) => item.id === note.mood)?.label || '😌';
  const preview = note.text || note.checklist?.map((item) => item.text).join(', ') || 'Yeni not';

  return (
    <motion.article
      layout
      whileHover={{ y: -2, scale: 1.006 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all ${
        active
          ? 'border-[var(--color-primary)] bg-[var(--color-surface)] shadow-elevated ring-4 ring-[var(--color-primary)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-surface)]/82 shadow-soft hover:border-[var(--color-primary)]/35'
      }`}
    >
      <button onClick={onSelect} className="block w-full text-left">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-surface)] text-[var(--color-primary)]">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-[var(--color-text)]">{note.title || 'Başlıksız not'}</h3>
              <p className="mt-0.5 text-[11px] text-[var(--color-muted-text)]">
                {note.time || format(parseISO(note.createdAt), 'HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {note.pinned && <Pin className="h-3.5 w-3.5 fill-[var(--color-primary)] text-[var(--color-primary)]" />}
            <span className="text-base">{mood}</span>
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-[var(--color-muted-text)]">{preview}</p>

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-[var(--color-soft-surface)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]">
            {note.category || 'ideas'}
          </span>
          {(note.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="rounded-full border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-muted-text)]">
              #{tag}
            </span>
          ))}
        </div>
      </button>

      <button
        onClick={onDelete}
        className="absolute bottom-3 right-3 rounded-full bg-[var(--color-surface)] p-2 text-[var(--color-muted-text)] opacity-0 shadow-soft transition-all hover:text-destructive group-hover:opacity-100"
        aria-label="Notu sil"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.article>
  );
}
