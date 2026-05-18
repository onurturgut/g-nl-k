import {
  Archive,
  Briefcase,
  CalendarDays,
  Hash,
  Inbox,
  Lightbulb,
  Pin,
  ShoppingBag,
  Trash2,
  User,
  Users,
} from 'lucide-react';

export type NoteFilter =
  | 'all'
  | 'pinned'
  | 'daily'
  | 'ideas'
  | 'work'
  | 'personal'
  | 'meetings'
  | 'shopping'
  | 'archive'
  | 'trash';

const folders = [
  { id: 'all' as NoteFilter, label: 'Tüm Notlar', icon: Inbox },
  { id: 'pinned' as NoteFilter, label: 'Sabitlenenler', icon: Pin },
  { id: 'daily' as NoteFilter, label: 'Günlük', icon: CalendarDays },
  { id: 'ideas' as NoteFilter, label: 'Fikirler', icon: Lightbulb },
  { id: 'work' as NoteFilter, label: 'İş', icon: Briefcase },
  { id: 'personal' as NoteFilter, label: 'Kişisel', icon: User },
  { id: 'meetings' as NoteFilter, label: 'Toplantılar', icon: Users },
  { id: 'shopping' as NoteFilter, label: 'Alışveriş', icon: ShoppingBag },
  { id: 'archive' as NoteFilter, label: 'Arşiv', icon: Archive },
  { id: 'trash' as NoteFilter, label: 'Son Silinenler', icon: Trash2 },
];

const tags = ['fikir', 'toplantı', 'günlük', 'iş', 'kişisel'];

interface NotesSidebarProps {
  activeFilter: NoteFilter;
  onFilterChange: (filter: NoteFilter) => void;
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export default function NotesSidebar({ activeFilter, onFilterChange, activeTag, onTagChange }: NotesSidebarProps) {
  return (
    <aside className="hidden min-h-[720px] w-64 shrink-0 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)]/82 p-4 shadow-soft backdrop-blur-xl lg:block">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">Klasörler</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text)]">Notlar</h2>
      </div>

      <nav className="space-y-1">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => {
              onFilterChange(folder.id);
              onTagChange(null);
            }}
            className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all ${
              activeFilter === folder.id && !activeTag
                ? 'bg-[var(--color-soft-surface)] text-[var(--color-text)] shadow-soft'
                : 'text-[var(--color-muted-text)] hover:bg-[var(--color-soft-surface)]/65 hover:text-[var(--color-text)]'
            }`}
          >
            <folder.icon className="h-4 w-4" />
            {folder.label}
          </button>
        ))}
      </nav>

      <div className="my-5 h-px bg-[var(--color-border)]" />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-[var(--color-muted-text)]">Etiketler</p>
        <div className="space-y-1">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagChange(activeTag === tag ? null : tag)}
              className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm transition-all ${
                activeTag === tag
                  ? 'bg-[var(--color-primary)] text-white shadow-soft'
                  : 'text-[var(--color-muted-text)] hover:bg-[var(--color-soft-surface)] hover:text-[var(--color-text)]'
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              {tag}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
