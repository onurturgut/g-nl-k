import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Save, Sparkles, PenLine, Heart, Target, AlertTriangle, ChevronLeft, ChevronRight, History, X } from 'lucide-react';
import { format, subDays, addDays, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { usePlannerStore, type JournalEntry } from '@/store/usePlannerStore';

interface Props {
  date: string;
}

const moods = [
  { value: 'great' as const, emoji: '🤩', label: 'Harika' },
  { value: 'good' as const, emoji: '😊', label: 'İyi' },
  { value: 'okay' as const, emoji: '😐', label: 'Fena Değil' },
  { value: 'bad' as const, emoji: '😔', label: 'Kötü' },
  { value: 'terrible' as const, emoji: '😞', label: 'Berbat' },
];

const moodEmoji: Record<JournalEntry['mood'], string> = {
  great: '🤩', good: '😊', okay: '😐', bad: '😔', terrible: '😞',
};

export default function Journal({ date: initialDate }: Props) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { journals, saveJournal } = usePlannerStore();
  const entry = journals[currentDate];

  const [mood] = useState<JournalEntry['mood']>(entry?.mood || 'okay');
  const currentMood = moods.find((item) => item.value === mood);
  const [dailyNotes, setDailyNotes] = useState(entry?.dailyNotes || '');
  const [whatIDid, setWhatIDid] = useState(entry?.whatIDid || '');
  const [whatWasMissing, setWhatWasMissing] = useState(entry?.whatWasMissing || '');
  const [tomorrowImprovement, setTomorrowImprovement] = useState(entry?.tomorrowImprovement || '');
  const [gratitude, setGratitude] = useState(entry?.gratitude || '');
  const [saved, setSaved] = useState(false);

  const dateObj = new Date(currentDate + 'T00:00:00');
  const displayDate = format(dateObj, "d MMMM yyyy, EEEE", { locale: tr });
  const isToday = currentDate === initialDate;

  const sortedJournals = useMemo(() => {
    return Object.values(journals)
      .filter((j) => j.dailyNotes || j.whatIDid || j.whatWasMissing || j.tomorrowImprovement || j.gratitude)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [journals]);

  useEffect(() => {
    setDailyNotes(entry?.dailyNotes || '');
    setWhatIDid(entry?.whatIDid || '');
    setWhatWasMissing(entry?.whatWasMissing || '');
    setTomorrowImprovement(entry?.tomorrowImprovement || '');
    setGratitude(entry?.gratitude || '');
  }, [currentDate, entry]);

  const goToPrev = () => setCurrentDate(format(subDays(dateObj, 1), 'yyyy-MM-dd'));
  const goToNext = () => {
    const next = format(addDays(dateObj, 1), 'yyyy-MM-dd');
    if (next <= initialDate) setCurrentDate(next);
  };
  const goToToday = () => setCurrentDate(initialDate);

  const handleSave = () => {
    saveJournal({ date: currentDate, whatIDid, whatWasMissing, tomorrowImprovement, mood, dailyNotes, gratitude });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { icon: PenLine, title: 'Günüm Nasıl Geçti?', placeholder: 'Bugün neler oldu, nasıl hissettin, neler yaşadın...', value: dailyNotes, setter: setDailyNotes, rows: 5 },
    { icon: Target, title: 'Neler Yaptım?', placeholder: 'Bugün başardıklarını, tamamladıklarını yaz...', value: whatIDid, setter: setWhatIDid, rows: 3 },
    { icon: AlertTriangle, title: 'Eksik Kalanlar', placeholder: 'Yapamadığın, ertelediğin şeyler...', value: whatWasMissing, setter: setWhatWasMissing, rows: 3 },
    { icon: Sparkles, title: 'Yarın İçin Planlarım', placeholder: 'Yarın neyi farklı yapacağım, hedeflerim...', value: tomorrowImprovement, setter: setTomorrowImprovement, rows: 3 },
    { icon: Heart, title: 'Minnettarlık', placeholder: 'Bugün neye minnettarsın?', value: gratitude, setter: setGratitude, rows: 2 },
  ];

  const HistoryList = () => (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-2 py-2 mb-1">
        <History className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Geçmiş</h3>
      </div>
      {sortedJournals.length === 0 && (
        <p className="text-xs text-muted-foreground/70 px-2 py-3">Henüz günlük yok.</p>
      )}
      {sortedJournals.map((j) => {
        const active = j.date === currentDate;
        const d = parseISO(j.date);
        const preview = (j.dailyNotes || j.whatIDid || j.gratitude || '').slice(0, 40);
        return (
          <button
            key={j.date}
            onClick={() => { setCurrentDate(j.date); setHistoryOpen(false); }}
            className={`w-full text-left rounded-lg px-2.5 py-2 transition-colors ${
              active
                ? 'bg-foreground/10 dark:bg-foreground/15'
                : 'hover:bg-foreground/5 dark:hover:bg-foreground/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-xs font-medium text-foreground">
                {format(d, 'd MMM', { locale: tr })}
              </span>
              <span className="text-sm">{moodEmoji[j.mood]}</span>
            </div>
            <p className="text-[10px] text-muted-foreground capitalize">
              {format(d, 'EEEE', { locale: tr })}
            </p>
            {preview && (
              <p className="text-[10px] text-muted-foreground/80 mt-1 line-clamp-1">{preview}</p>
            )}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="relative bg-muted/40 dark:bg-muted/30 rounded-2xl shadow-elevated overflow-hidden border border-border/60">

        {/* History drawer (all sizes, opens on button click) */}
        {historyOpen && (
          <>
            <div
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 bg-foreground/30 backdrop-blur-sm z-40 animate-fade-in"
            />
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border z-50 p-3 overflow-y-auto animate-slide-in">
              <div className="flex justify-end mb-2">
                <button onClick={() => setHistoryOpen(false)} className="p-1 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <HistoryList />
            </aside>
          </>
        )}

        <div className="p-5 space-y-5 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-serif text-lg font-semibold text-foreground">Günlüğüm</h2>
            </div>
            <button
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              Geçmiş
            </button>
          </div>

          {/* Date navigation */}
          <div className="flex items-center justify-between bg-background/60 dark:bg-background/30 rounded-xl px-3 py-2 border border-border/40">
            <button onClick={goToPrev} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground capitalize">{displayDate}</p>
              {currentMood && <p className="text-[10px] text-muted-foreground">{currentMood.emoji} {currentMood.label}</p>}
              {!isToday && (
                <button onClick={goToToday} className="text-[10px] text-muted-foreground hover:text-foreground hover:underline mt-0.5">
                  Bugüne dön
                </button>
              )}
            </div>
            <button
              onClick={goToNext}
              disabled={isToday}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="border-b border-dashed border-border/50 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <section.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <label className="text-xs font-semibold text-foreground/80">{section.title}</label>
                </div>
                <textarea
                  value={section.value}
                  onChange={(e) => section.setter(e.target.value)}
                  rows={section.rows}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none resize-none leading-7"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 27px, hsl(var(--border) / 0.4) 27px, hsl(var(--border) / 0.4) 28px)',
                    backgroundPositionY: '-1px',
                  }}
                  placeholder={section.placeholder}
                />
              </div>
            ))}
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`w-full rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
              saved
                ? 'bg-success text-success-foreground'
                : 'bg-foreground text-background hover:opacity-90'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Kaydedildi! ✓' : 'Günlüğü Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
