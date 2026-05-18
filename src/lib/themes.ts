export type ThemeId =
  | 'green-focus'
  | 'blue-flow'
  | 'warm-sunset'
  | 'aurora-green'
  | 'lavender-purple'
  | 'rose-pink'
  | 'night-navy'
  | 'dark-neon'
  | 'minimal-gray'
  | 'mint-soft';

export interface AppTheme {
  id: ThemeId;
  number: string;
  name: string;
  description: string;
  mood: string;
  dark: boolean;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    background: string;
    surface: string;
    softSurface: string;
    text: string;
    mutedText: string;
    border: string;
  };
  preview: {
    gradient: string;
    glow: string;
    illustration: 'leaves' | 'waves' | 'sunset' | 'botanical' | 'lavender' | 'rose' | 'cosmic' | 'neon' | 'mono' | 'mint';
  };
}

export const DEFAULT_THEME_ID: ThemeId = 'green-focus';
export const THEME_STORAGE_KEY = 'planner-theme-id';

export const themes: AppTheme[] = [
  {
    id: 'green-focus',
    number: '01',
    name: 'Yeşil Odak',
    description: 'Doğal, ferah ve odaklanmış bir deneyim.',
    mood: 'Odak',
    dark: false,
    colors: {
      primary: '#0F8B73',
      primaryDark: '#056457',
      accent: '#37C99E',
      background: '#F3FBF8',
      surface: '#FFFFFF',
      softSurface: '#E6F7F1',
      text: '#10201D',
      mutedText: '#6B7C78',
      border: '#D8EAE5',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0F8B73 0%, #37C99E 48%, #E6F7F1 100%)',
      glow: '#37C99E',
      illustration: 'leaves',
    },
  },
  {
    id: 'blue-flow',
    number: '02',
    name: 'Mavi Akış',
    description: 'Modern, profesyonel ve güven veren bir tasarım.',
    mood: 'Akış',
    dark: false,
    colors: {
      primary: '#2563EB',
      primaryDark: '#1E40AF',
      accent: '#60A5FA',
      background: '#F3F7FF',
      surface: '#FFFFFF',
      softSurface: '#E8F0FF',
      text: '#0F172A',
      mutedText: '#64748B',
      border: '#D7E3F8',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #1E40AF 0%, #60A5FA 55%, #E8F0FF 100%)',
      glow: '#60A5FA',
      illustration: 'waves',
    },
  },
  {
    id: 'warm-sunset',
    number: '03',
    name: 'Sıcak Sunset',
    description: 'Sıcak renklerle motive eden bir deneyim.',
    mood: 'Motivasyon',
    dark: false,
    colors: {
      primary: '#F97316',
      primaryDark: '#C2410C',
      accent: '#FDBA74',
      background: '#FFF7ED',
      surface: '#FFFFFF',
      softSurface: '#FFEDD5',
      text: '#231A12',
      mutedText: '#7C5F46',
      border: '#FED7AA',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #C2410C 0%, #F97316 50%, #FDBA74 100%)',
      glow: '#FDBA74',
      illustration: 'sunset',
    },
  },
  {
    id: 'aurora-green',
    number: '04',
    name: 'Aurora Yeşil',
    description: 'Doğadan ilham alan premium tema.',
    mood: 'Doğa',
    dark: false,
    colors: {
      primary: '#0D9488',
      primaryDark: '#115E59',
      accent: '#5EEAD4',
      background: '#ECFDF5',
      surface: '#FFFFFF',
      softSurface: '#CCFBF1',
      text: '#102A27',
      mutedText: '#5F7F79',
      border: '#BFEDE5',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #115E59 0%, #0D9488 48%, #5EEAD4 100%)',
      glow: '#5EEAD4',
      illustration: 'botanical',
    },
  },
  {
    id: 'lavender-purple',
    number: '05',
    name: 'Lavanta Moru',
    description: 'Yaratıcı, ilham verici ve premium bir atmosfer.',
    mood: 'Yaratıcılık',
    dark: false,
    colors: {
      primary: '#7C3AED',
      primaryDark: '#5B21B6',
      accent: '#C4B5FD',
      background: '#FAF5FF',
      surface: '#FFFFFF',
      softSurface: '#F3E8FF',
      text: '#1E1233',
      mutedText: '#75658A',
      border: '#E9D5FF',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #5B21B6 0%, #7C3AED 52%, #C4B5FD 100%)',
      glow: '#C4B5FD',
      illustration: 'lavender',
    },
  },
  {
    id: 'rose-pink',
    number: '06',
    name: 'Gül Pembe',
    description: 'Sıcak, motive edici ve pozitif bir deneyim.',
    mood: 'Pozitif',
    dark: false,
    colors: {
      primary: '#EC4899',
      primaryDark: '#BE185D',
      accent: '#F9A8D4',
      background: '#FFF1F7',
      surface: '#FFFFFF',
      softSurface: '#FCE7F3',
      text: '#2A1020',
      mutedText: '#86586F',
      border: '#FBCFE8',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #BE185D 0%, #EC4899 52%, #F9A8D4 100%)',
      glow: '#F9A8D4',
      illustration: 'rose',
    },
  },
  {
    id: 'night-navy',
    number: '07',
    name: 'Gece Lacivert',
    description: 'Odak artıran güçlü dark mode.',
    mood: 'Gece',
    dark: true,
    colors: {
      primary: '#3B82F6',
      primaryDark: '#1D4ED8',
      accent: '#22D3EE',
      background: '#07111F',
      surface: '#0F1B2D',
      softSurface: '#17243A',
      text: '#F8FAFC',
      mutedText: '#94A3B8',
      border: '#24344F',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #07111F 0%, #1D4ED8 58%, #22D3EE 100%)',
      glow: '#22D3EE',
      illustration: 'cosmic',
    },
  },
  {
    id: 'dark-neon',
    number: '08',
    name: 'Karanlık Neon',
    description: 'Futuristic premium dark mode.',
    mood: 'Neon',
    dark: true,
    colors: {
      primary: '#A855F7',
      primaryDark: '#7E22CE',
      accent: '#22C55E',
      background: '#080A12',
      surface: '#111827',
      softSurface: '#1F2937',
      text: '#F9FAFB',
      mutedText: '#9CA3AF',
      border: '#2D3748',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #080A12 0%, #7E22CE 52%, #22C55E 100%)',
      glow: '#A855F7',
      illustration: 'neon',
    },
  },
  {
    id: 'minimal-gray',
    number: '09',
    name: 'Minimal Gri',
    description: 'Sade ve dikkat dağıtmayan minimal deneyim.',
    mood: 'Minimal',
    dark: false,
    colors: {
      primary: '#111827',
      primaryDark: '#030712',
      accent: '#6B7280',
      background: '#F9FAFB',
      surface: '#FFFFFF',
      softSurface: '#F3F4F6',
      text: '#111827',
      mutedText: '#6B7280',
      border: '#E5E7EB',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #030712 0%, #6B7280 52%, #F3F4F6 100%)',
      glow: '#6B7280',
      illustration: 'mono',
    },
  },
  {
    id: 'mint-soft',
    number: '10',
    name: 'Mint Soft',
    description: 'Sakin ve hafif günlük kullanım deneyimi.',
    mood: 'Sakin',
    dark: false,
    colors: {
      primary: '#14B8A6',
      primaryDark: '#0F766E',
      accent: '#99F6E4',
      background: '#F0FDFA',
      surface: '#FFFFFF',
      softSurface: '#CCFBF1',
      text: '#10201D',
      mutedText: '#6B7C78',
      border: '#BFEDE5',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #99F6E4 100%)',
      glow: '#99F6E4',
      illustration: 'mint',
    },
  },
];

export function getTheme(themeId: string | null | undefined) {
  return themes.find((theme) => theme.id === themeId) || themes.find((theme) => theme.id === DEFAULT_THEME_ID)!;
}
