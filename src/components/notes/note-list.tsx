import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import NoteCard from '@/components/notes/note-card';
import SearchBar from '@/components/notes/search-bar';
import type { QuickNote } from '@/store/usePlannerStore';

interface NoteListProps {
  notes: QuickNote[];
  selectedId: string | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

export default function NoteList({ notes, selectedId, query, onQueryChange, onSelect, onCreate, onDelete }: NoteListProps) {
  return (
    <section className="min-h-[720px] min-w-0 flex-1 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/76 p-4 shadow-soft backdrop-blur-xl">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">Notlar</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-text)]">{notes.length} not · ikinci beyin alanı</p>
        </div>
        <button
          onClick={onCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 text-sm font-semibold text-white shadow-elevated transition-all hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Hızlı Not
        </button>
      </div>

      <div className="mb-4">
        <SearchBar value={query} onChange={onQueryChange} />
      </div>

      {notes.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-soft-surface)]/45 p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-surface)] text-2xl shadow-soft">✍️</div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Henüz not yok</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted-text)]">
            Bir fikir, günlük cümlesi veya toplantı notu ekleyerek düşünce merkezini başlat.
          </p>
        </div>
      ) : (
        <motion.div layout className="grid gap-3 xl:grid-cols-2">
          <AnimatePresence initial={false}>
            {notes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <NoteCard
                  note={note}
                  active={note.id === selectedId}
                  onSelect={() => onSelect(note.id)}
                  onDelete={() => onDelete(note.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
