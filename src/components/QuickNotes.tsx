import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import NoteEditor from '@/components/notes/note-editor';
import NoteList from '@/components/notes/note-list';
import NotesSidebar, { type NoteFilter } from '@/components/notes/sidebar';
import QuickActions from '@/components/notes/quick-actions';
import NotesThemeSelector from '@/components/notes/theme-selector';
import { usePlannerStore, type QuickNote } from '@/store/usePlannerStore';

function getDefaultNote(): Omit<QuickNote, 'id' | 'createdAt'> {
  const now = new Date();

  return {
    title: 'Yeni not',
    text: '',
    date: format(now, 'yyyy-MM-dd'),
    time: format(now, 'HH:mm'),
    type: 'idea',
    category: 'ideas',
    tags: ['fikir'],
    mood: 'calm',
    pinned: false,
  };
}

function matchesFilter(note: QuickNote, filter: NoteFilter) {
  if (filter === 'all') return note.category !== 'trash';
  if (filter === 'pinned') return Boolean(note.pinned);
  return note.category === filter;
}

export default function QuickNotes() {
  const notes = usePlannerStore((state) => state.notes);
  const addNote = usePlannerStore((state) => state.addNote);
  const updateNote = usePlannerStore((state) => state.updateNote);
  const deleteNote = usePlannerStore((state) => state.deleteNote);
  const [activeFilter, setActiveFilter] = useState<NoteFilter>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id || null);

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');

    return [...notes]
      .filter((note) => matchesFilter(note, activeFilter))
      .filter((note) => !activeTag || (note.tags || []).includes(activeTag))
      .filter((note) => {
        if (!normalizedQuery) return true;
        return `${note.title || ''} ${note.text} ${(note.tags || []).join(' ')}`.toLocaleLowerCase('tr-TR').includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt);
      });
  }, [activeFilter, activeTag, notes, query]);

  const selectedNote = useMemo(() => {
    return notes.find((note) => note.id === selectedId) || visibleNotes[0] || null;
  }, [notes, selectedId, visibleNotes]);

  const handleCreate = () => {
    addNote(getDefaultNote());
    window.setTimeout(() => {
      const latest = usePlannerStore.getState().notes[0];
      setSelectedId(latest?.id || null);
    }, 0);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    if (selectedId === id) {
      const next = notes.find((note) => note.id !== id);
      setSelectedId(next?.id || null);
    }
  };

  return (
    <div className="relative animate-fade-in">
      <div className="mb-4 flex flex-col gap-3 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/72 p-4 shadow-soft backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">Kişisel düşünce merkezi</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--color-text)]">Notlar Sistemi</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-text)]">Günlük, fikir, toplantı ve checklist notlarını tek alanda topla.</p>
        </div>
        <NotesThemeSelector />
      </div>

      <div className="flex gap-4">
        <NotesSidebar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          activeTag={activeTag}
          onTagChange={setActiveTag}
        />

        <NoteList
          notes={visibleNotes}
          selectedId={selectedNote?.id || null}
          query={query}
          onQueryChange={setQuery}
          onSelect={setSelectedId}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedNote?.id || 'empty'}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 18 }}
            className="hidden xl:block"
          >
            <NoteEditor
              note={selectedNote}
              onUpdate={(updates) => {
                if (selectedNote) updateNote(selectedNote.id, updates);
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 xl:hidden">
        <NoteEditor
          note={selectedNote}
          onUpdate={(updates) => {
            if (selectedNote) updateNote(selectedNote.id, updates);
          }}
        />
      </div>

      <QuickActions onQuickNote={handleCreate} />
    </div>
  );
}
