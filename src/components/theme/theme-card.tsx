'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import type { AppTheme } from '@/lib/themes';

interface ThemeCardProps {
  theme: AppTheme;
  active: boolean;
  onSelect: () => void;
}

function ThemeIllustration({ type }: { type: AppTheme['preview']['illustration'] }) {
  if (type === 'waves') {
    return (
      <svg viewBox="0 0 240 180" className="absolute inset-0 h-full w-full opacity-70" aria-hidden="true">
        <path d="M-20 126C38 76 72 158 126 106s86-24 134-66" fill="none" stroke="white" strokeWidth="16" strokeLinecap="round" opacity=".25" />
        <path d="M-28 152C32 94 80 170 136 126s82-20 126-58" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" opacity=".35" />
      </svg>
    );
  }

  if (type === 'sunset') {
    return (
      <svg viewBox="0 0 240 180" className="absolute inset-0 h-full w-full opacity-75" aria-hidden="true">
        <circle cx="176" cy="56" r="34" fill="white" opacity=".24" />
        <path d="M14 148c34-34 58-28 82 0s60 30 126-8v60H14z" fill="white" opacity=".18" />
        <path d="M0 166c42-24 80-20 114 0s76 22 136-8v42H0z" fill="white" opacity=".16" />
      </svg>
    );
  }

  if (type === 'cosmic') {
    return (
      <svg viewBox="0 0 240 180" className="absolute inset-0 h-full w-full opacity-80" aria-hidden="true">
        <circle cx="176" cy="58" r="28" fill="white" opacity=".22" />
        {[36, 78, 118, 204, 220].map((x, index) => (
          <circle key={x} cx={x} cy={index % 2 ? 42 : 88} r={index + 2} fill="white" opacity=".42" />
        ))}
        <path d="M16 142c42-28 82-30 120-4s62 18 94-10" fill="none" stroke="white" strokeWidth="2" opacity=".18" />
      </svg>
    );
  }

  if (type === 'neon') {
    return (
      <svg viewBox="0 0 240 180" className="absolute inset-0 h-full w-full opacity-85" aria-hidden="true">
        <path d="M24 142 88 64l42 48 52-72 34 42" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" opacity=".32" />
        <path d="M40 54h72M132 128h76" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".35" />
      </svg>
    );
  }

  if (type === 'mono') {
    return (
      <svg viewBox="0 0 240 180" className="absolute inset-0 h-full w-full opacity-70" aria-hidden="true">
        <rect x="148" y="28" width="58" height="58" rx="14" fill="white" opacity=".22" />
        <circle cx="74" cy="84" r="34" fill="white" opacity=".16" />
        <path d="M44 142h150M44 122h96" stroke="white" strokeWidth="8" strokeLinecap="round" opacity=".18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 240 180" className="absolute inset-0 h-full w-full opacity-75" aria-hidden="true">
      <path d="M166 42c-34 14-52 42-48 84 36-10 58-38 48-84Z" fill="white" opacity=".24" />
      <path d="M86 82c-24 10-40 30-38 62 28-6 46-28 38-62Z" fill="white" opacity=".22" />
      <path d="M136 140c-6-36 0-70 28-104M72 148c0-28 8-50 28-72" stroke="white" strokeWidth="5" strokeLinecap="round" opacity=".28" />
    </svg>
  );
}

export default function ThemeCard({ theme, active, onSelect }: ThemeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`group relative min-h-72 overflow-hidden rounded-[32px] border p-5 text-left shadow-elevated transition-all ${
        active ? 'border-[var(--color-primary)] ring-4 ring-[var(--color-primary)]/20' : 'border-white/25'
      }`}
      style={{
        background: theme.preview.gradient,
        boxShadow: active
          ? `0 24px 70px -36px ${theme.preview.glow}, 0 0 0 1px ${theme.colors.primary}`
          : `0 22px 55px -40px ${theme.preview.glow}`,
      }}
    >
      <motion.div
        className="absolute inset-0 opacity-80"
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        style={{
          backgroundImage: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.26), transparent)',
          backgroundSize: '220% 220%',
        }}
      />
      <ThemeIllustration type={theme.preview.illustration} />

      <div className="relative z-10 flex h-full min-h-60 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-5xl font-semibold tracking-tight text-white/55">{theme.number}</span>
            {active ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                <Check className="h-3.5 w-3.5" />
                Seçili
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                {theme.mood}
              </span>
            )}
          </div>
          <h3 className="mt-8 text-2xl font-semibold tracking-tight text-white">{theme.name}</h3>
          <p className="mt-2 max-w-64 text-sm leading-6 text-white/82">{theme.description}</p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          {['Haftalık Planlama', 'Günlük Planlama'].map((feature) => (
            <div
              key={feature}
              className="rounded-2xl border border-white/25 bg-white/16 px-3 py-3 text-xs font-semibold text-white shadow-soft backdrop-blur-xl transition-colors group-hover:bg-white/22"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
