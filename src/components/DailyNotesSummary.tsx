import { format, parseISO } from 'date-fns';
import { NotebookPen } from 'lucide-react';
import { usePlannerStore } from '@/store/usePlannerStore';

interface Props {
  date: string;
  onOpenNotes: () => void;
}

export default function DailyNotesSummary({ date, onOpenNotes }: Props) {
  const notes = usePlannerStore((s) => s.notes);
  const dayNotes = notes
    .filter((note) => note.date === date)
    .sort((a, b) => {
      const timeCompare = (a.time || '99:99').localeCompare(b.time || '99:99');
      if (timeCompare !== 0) return timeCompare;
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Günün notları</h2>
        </div>
        <button onClick={onOpenNotes} className="text-xs font-medium text-primary hover:underline">
          Notlara git
        </button>
      </div>

      {dayNotes.length === 0 ? (
        <button
          onClick={onOpenNotes}
          className="w-full rounded-xl border border-dashed border-border bg-card/80 px-4 py-5 text-center transition-colors hover:bg-muted/50"
        >
          <p className="text-sm font-medium text-foreground">Bu güne ait not yok</p>
          <p className="mt-1 text-xs text-muted-foreground">Tarihli bir not eklediğinde burada görünür.</p>
        </button>
      ) : (
        <div className="surface-panel rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-3">
            <p className="text-xs font-medium capitalize text-muted-foreground">
              {format(parseISO(date), 'd MMMM yyyy')}
            </p>
            <span className="rounded-md bg-muted px-2 py-1 text-[10px] text-muted-foreground">{dayNotes.length} not</span>
          </div>
          <div className="space-y-2">
            {dayNotes.slice(0, 3).map((note) => (
              <article key={note.id} className="rounded-lg bg-muted/50 px-3 py-2">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-foreground">{note.title || 'Başlıksız not'}</h3>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {note.time || format(parseISO(note.createdAt), 'HH:mm')}
                  </span>
                </div>
                {note.text && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{note.text}</p>}
              </article>
            ))}
          </div>
          {dayNotes.length > 3 && (
            <button
              onClick={onOpenNotes}
              className="mt-3 w-full rounded-lg bg-muted px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {dayNotes.length - 3} not daha göster
            </button>
          )}
        </div>
      )}
    </section>
  );
}
