'use client';

import { motion } from 'framer-motion';
import ThemeCard from '@/components/theme/theme-card';
import { useTheme } from '@/hooks/useTheme';
import { themes } from '@/lib/themes';

export default function ThemeSelector() {
  const { themeId, setTheme } = useTheme();

  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-soft sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-primary)]">Dinamik Tema Sistemi</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text)]">Tema Seçimi</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-muted-text)]">
            Haftalık planlama, günlük akış, görev kartları, analizler ve modal alanları seçtiğin tema diline uyarlanır.
          </p>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-soft-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--color-muted-text)]">
          {themes.length} premium tema
        </div>
      </div>

      <motion.div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.045,
            },
          },
        }}
      >
        {themes.map((theme) => (
          <motion.div
            key={theme.id}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <ThemeCard theme={theme} active={theme.id === themeId} onSelect={() => setTheme(theme.id)} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
