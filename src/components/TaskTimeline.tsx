import { useMemo } from 'react';
import { Check, Clock, RotateCcw, Trash2 } from 'lucide-react';
import { categoryLabels, usePlannerStore } from '@/store/usePlannerStore';

const categoryColorMap: Record<string, string> = {
  work: 'bg-category-work/12 text-category-work',
  personal: 'bg-category-personal/12 text-category-personal',
  sport: 'bg-category-sport/12 text-category-sport',
  health: 'bg-category-health/12 text-category-health',
  education: 'bg-category-education/15 text-category-education',
  other: 'bg-category-other/12 text-category-other',
};

const priorityDot: Record<string, string> = {
  high: 'bg-destructive',
  medium: 'bg-warning',
  low: 'bg-success',
};

interface Props {
  date: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function TaskTimeline({
  date,
  emptyTitle = 'Henüz görev eklenmedi',
  emptyDescription = 'Yeni görev ekleyerek güne başla',
}: Props) {
  const allTasks = usePlannerStore((s) => s.tasks);
  const tasks = useMemo(
    () => allTasks.filter((task) => task.date === date).sort((a, b) => a.time.localeCompare(b.time)),
    [allTasks, date],
  );
  const { deleteTask, toggleTaskStatus, updateTask } = usePlannerStore();

  if (tasks.length === 0) {
    return (
      <div className="surface-panel rounded-xl p-8 text-center animate-fade-in">
        <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{emptyTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground/70">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="surface-panel overflow-hidden rounded-xl animate-fade-in">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          className={`group border-b border-border/70 p-4 transition-colors last:border-b-0 hover:bg-muted/45 ${
            task.status === 'completed' ? 'opacity-65' : ''
          }`}
          style={{ animationDelay: `${index * 35}ms` }}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleTaskStatus(task.id)}
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                task.status === 'completed'
                  ? 'border-success bg-success'
                  : 'border-border bg-card hover:border-primary'
              }`}
              aria-label="Görev durumunu değiştir"
            >
              {task.status === 'completed' && <Check className="h-3.5 w-3.5 text-success-foreground" />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{task.time}</span>
                <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${categoryColorMap[task.category]}`}>
                  {categoryLabels[task.category]}
                </span>
                <span className={`h-2 w-2 rounded-full ${priorityDot[task.priority]}`} />
              </div>
              <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </p>
              {task.note && <p className="mt-1 text-xs leading-5 text-muted-foreground">{task.note}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              {task.status !== 'completed' && (
                <button
                  onClick={() => updateTask(task.id, { status: 'postponed' })}
                  className="rounded-lg p-1.5 transition-colors hover:bg-accent"
                  title="Ertele"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="rounded-lg p-1.5 transition-colors hover:bg-destructive/10"
                title="Sil"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
