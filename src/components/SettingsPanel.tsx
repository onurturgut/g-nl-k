import { Settings } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import PwaStatus from '@/components/PwaStatus';
import AuthStatus from '@/components/AuthStatus';
import ThemeSelector from '@/components/theme/theme-selector';

export default function SettingsPanel() {
  return (
    <div className="space-y-4 animate-fade-in">
      <section className="glass-strong rounded-2xl p-5 shadow-soft">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Ayarlar</h2>
            <p className="text-xs text-muted-foreground">Bildirim, zil sesi ve uygulama davranışlarını buradan yönet.</p>
          </div>
        </div>
      </section>
      <ThemeSelector />
      <AuthStatus />
      <PwaStatus />
      <NotificationSettings />
    </div>
  );
}
