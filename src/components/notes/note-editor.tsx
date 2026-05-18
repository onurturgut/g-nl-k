import { format, parseISO } from 'date-fns';
import { Sparkles, Link as LinkIcon, Pin } from 'lucide-react';
import MoodPicker from '@/components/notes/mood-picker';
import NoteToolbar from '@/components/notes/note-toolbar';
import type { QuickNote } from '@/store/usePlannerStore';

interface NoteEditorProps {
  note: QuickNote | null;
  onUpdate: (updates: Partial<QuickNote>) => void;
}

export default function NoteEditor({ note, onUpdate }: NoteEditorProps) {
  if (!note) {
    return (
      <section className="hidden min-h-[720px] w-[360px] shrink-0 items-center justify-center rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/72 p-6 text-center shadow-soft backdrop-blur-xl xl:flex">
        <div>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--color-soft-surface)] text-2xl">📝</div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Bir not seç</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-text)]">İçeriği düzenlemek ve AI özetlerini görmek için listeden bir not aç.</p>
        </div>
      </section>
    );
  }

  const tagsText = (note.tags || []).join(', ');

  return (
    <section className="min-h-[720px] w-full shrink-0 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/82 p-4 shadow-elevated backdrop-blur-xl xl:w-[420px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">Not Detayı</p>
          <p className="mt-1 text-xs text-[var(--color-muted-text)]">
            {format(parseISO(note.updatedAt || note.createdAt), 'dd.MM.yyyy HH:mm')}
          </p>
        </div>
        <button
          onClick={() => onUpdate({ pinned: !note.pinned })}
          className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
            note.pinned
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] text-[var(--color-muted-text)] hover:text-[var(--color-text)]'
          }`}
          title="Sabitle"
        >
          <Pin className="h-4 w-4" />
        </button>
      </div>

      <input
        value={note.title || ''}
        onChange={(event) => onUpdate({ title: event.target.value })}
        placeholder="Başlık"
        className="mb-3 w-full bg-transparent text-3xl font-semibold tracking-tight text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted-text)]"
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <MoodPicker value={note.mood} onChange={(mood) => onUpdate({ mood })} />
        <select
          value={note.category || 'ideas'}
          onChange={(event) => onUpdate({ category: event.target.value as QuickNote['category'] })}
          className="h-10 rounded-full border border-[var(--color-border)] bg-[var(--color-soft-surface)] px-3 text-sm text-[var(--color-text)] outline-none"
        >
          <option value="daily">Günlük</option>
          <option value="ideas">Fikirler</option>
          <option value="work">İş</option>
          <option value="personal">Kişisel</option>
          <option value="meetings">Toplantılar</option>
          <option value="shopping">Alışveriş</option>
          <option value="archive">Arşiv</option>
        </select>
      </div>

      <div className="mb-4">
        <NoteToolbar />
      </div>

      <textarea
        value={note.text}
        onChange={(event) => onUpdate({ text: event.target.value })}
        placeholder="Düşüncelerini yaz..."
        className="min-h-64 w-full resize-none rounded-[24px] border border-[var(--color-border)] bg-[var(--color-soft-surface)]/40 px-4 py-4 text-[15px] leading-7 text-[var(--color-text)] outline-none transition-all placeholder:text-[var(--color-muted-text)] focus:border-[var(--color-primary)]/45 focus:bg-[var(--color-surface)]"
      />

      <label className="mt-4 block">
        <span className="mb-1 block text-xs font-semibold text-[var(--color-muted-text)]">Etiketler</span>
        <input
          value={tagsText}
          onChange={(event) =>
            onUpdate({
              tags: event.target.value
                .split(',')
                .map((tag) => tag.trim().replace(/^#/, ''))
                .filter(Boolean),
            })
          }
          placeholder="fikir, toplantı, günlük"
          className="h-10 w-full rounded-full border border-[var(--color-border)] bg-transparent px-3 text-sm outline-none focus:border-[var(--color-primary)]/45"
        />
      </label>

      <div className="mt-4 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-soft-surface)]/60 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">AI Summary</h3>
        </div>
        <p className="text-sm leading-6 text-[var(--color-muted-text)]">
          {note.aiSummary || 'Uzun notlar burada özetlenir. Yakında görev algılama ve akıllı kategori önerileri bu alanda görünecek.'}
        </p>
      </div>

      <div className="mt-3 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="mb-2 flex items-center gap-2">
          <LinkIcon className="h-4 w-4 text-[var(--color-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Bağlantılı görevler</h3>
        </div>
        <p className="text-sm text-[var(--color-muted-text)]">“Cuma müşteri ara” gibi cümleler görev önerisine dönüşebilir.</p>
      </div>
    </section>
  );
}
