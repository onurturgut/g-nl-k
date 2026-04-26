'use client';

import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export default function PwaStatus() {
  const [supported, setSupported] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator);
    setStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as NavigatorWithStandalone).standalone),
    );
  }, []);

  return (
    <section className="glass rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <Smartphone className="h-4 w-4 text-muted-foreground" />
        <div>
          <h3 className="text-sm font-semibold text-foreground">PWA Durumu</h3>
          <p className="text-xs text-muted-foreground">
            {supported
              ? standalone
                ? 'Uygulama yüklü modda çalışıyor.'
                : 'Tarayıcı destekliyor. Menüden ana ekrana/uygulamalara ekleyebilirsin.'
              : 'Bu tarayıcı PWA service worker desteği sunmuyor.'}
          </p>
        </div>
      </div>
    </section>
  );
}
