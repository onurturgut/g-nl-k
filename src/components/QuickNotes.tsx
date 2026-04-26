import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarDays, Clock, NotebookPen, Plus, Search, Trash2, X } from 'lucide-react';
import { usePlannerStore, type QuickNote } from '@/store/usePlannerStore';

interface NoteGroup {
  key: string;
  label: string;
  notes: QuickNote[];
}

export default function QuickNotes() {
  const notes = usePlannerStore((s) => s.notes);
  const addNote = usePlannerStore((s) => s.addNote);
  const deleteNote = usePlannerStore((s) => s.deleteNote);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [query, setQuery] = useState('');
  const [useDateTime, setUseDateTime] = useState(false);
  const [noteDate, setNoteDate] = useState('');
  const [noteTime, setNoteTime] = useState('');

  const visibleNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('tr-TR');
    const scopedNotes = useDateTime && noteDate
      ? notes.filter((note) => note.date === noteDate)
      : notes;

    return [...scopedNotes].sort((a, b) => {
      if (normalizedQuery) {
        const aMatches = `${a.title || ''} ${a.text}`.toLocaleLowerCase('tr-TR').includes(normalizedQuery);
        const bMatches = `${b.title || ''} ${b.text}`.toLocaleLowerCase('tr-TR').includes(normalizedQuery);
        if (aMatches !== bMatches) return aMatches ? -1 : 1;
      }

      const aDate = a.date || '9999-12-31';
      const bDate = b.date || '9999-12-31';
      const dateCompare = aDate.localeCompare(bDate);
      if (dateCompare !== 0) return dateCompare;

      const aTime = a.time || '99:99';
      const bTime = b.time || '99:99';
      const timeCompare = aTime.localeCompare(bTime);
      if (timeCompare !== 0) return timeCompare;

      return b.createdAt.localeCompare(a.createdAt);
    }).filter((note) => {
      if (!normalizedQuery) return true;
      return `${note.title || ''} ${note.text}`.toLocaleLowerCase('tr-TR').includes(normalizedQuery);
    });
  }, [noteDate, notes, query, useDateTime]);

  const noteGroups = useMemo<NoteGroup[]>(() => {
    const map = new Map<string, QuickNote[]>();

    for (const note of visibleNotes) {
      const key = note.date || 'undated';
      const current = map.get(key) || [];
      current.push(note);
      map.set(key, current);
    }

    return Array.from(map.entries()).map(([key, groupNotes]) => ({
      key,
      notes: groupNotes,
      label: key === 'undated'
        ? 'Tarihsiz Notlar'
        : format(parseISO(key), 'd MMMM yyyy, EEEE', { locale: tr }),
    }));
  }, [visibleNotes]);

  const listTitle = useDateTime && noteDate ? 'Seçili tarih arşivi' : 'Not arşivi';

  const enableDateTime = () => {
    const now = new Date();
    setUseDateTime(true);
    setNoteDate((current) => current || format(now, 'yyyy-MM-dd'));
    setNoteTime((current) => current || format(now, 'HH:mm'));
  };

  const clearDateTime = () => {
    setUseDateTime(false);
    setNoteDate('');
    setNoteTime('');
  };

  const saveNote = () => {
    if (!title.trim() && !text.trim()) return;

    addNote({
      title: title.trim() || undefined,
      text: text.trim(),
      date: useDateTime && noteDate ? noteDate : undefined,
      time: useDateTime && noteTime ? noteTime : undefined,
    });

    setTitle('');
    setText('');
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="glass-strong rounded-2xl shadow-soft p-5 space-y-4">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Not Arşivi</h2>
            <p className="text-xs text-muted-foreground">Notlar burada kalır; tarih seçersen aynı güne ait notlar tek arşiv kartında listelenir.</p>
          </div>
        </div>

        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Not başlığı..."
          className="w-full rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/25"
        />

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          placeholder="Notunu hızlıca yaz..."
          className="w-full resize-none rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/25"
        />

        <div className="flex flex-wrap items-center gap-2">
          {!useDateTime ? (
            <button
              onClick={enableDateTime}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <CalendarDays className="h-4 w-4" />
              Tarih/Saat Ekle
            </button>
          ) : (
            <>
              <label className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <input
                  type="date"
                  value={noteDate}
                  onChange={(event) => setNoteDate(event.target.value)}
                  className="bg-transparent outline-none"
                />
              </label>
              <label className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                <input
                  type="time"
                  value={noteTime}
                  onChange={(event) => setNoteTime(event.target.value)}
                  className="bg-transparent outline-none"
                />
              </label>
              <button
                onClick={clearDateTime}
                className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Tarih ve saati kaldır"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={saveNote}
            disabled={!title.trim() && !text.trim()}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Arşive Ekle
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground">{listTitle}</h3>
            <span className="text-[10px] text-muted-foreground">{visibleNotes.length} not</span>
          </div>
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Başlık veya not içinde ara..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
          </label>
        </div>

        {noteGroups.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center shadow-soft">
            <NotebookPen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {useDateTime && noteDate ? 'Bu tarihte henüz not yok.' : 'Arşivde henüz not yok.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {noteGroups.map((group) => (
              <article key={group.key} className="glass rounded-2xl p-4 shadow-soft">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
                  <h4 className="text-sm font-semibold capitalize text-foreground">{group.label}</h4>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] text-muted-foreground">
                    {group.notes.length} not
                  </span>
                </div>
                <div className="space-y-3">
                  {group.notes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-background/45 px-3 py-3">
                      <div className="mb-1 flex items-start justify-between gap-3">
                        <h5 className="text-sm font-semibold text-foreground">
                          {note.title || 'Başlıksız not'}
                        </h5>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {note.time || format(parseISO(note.createdAt), 'HH:mm')}
                          </span>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Notu sil"
                            title="Notu sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      {note.text && (
                        <p className="whitespace-pre-wrap text-sm leading-6 text-foreground/85">{note.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
