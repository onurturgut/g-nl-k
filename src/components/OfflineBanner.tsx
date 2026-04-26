import { useEffect, useRef, useState } from "react";
import { WifiOff, BellOff } from "lucide-react";
import { toast } from "sonner";

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const warnedRef = useRef(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (!online && !warnedRef.current) {
      warnedRef.current = true;
      toast.warning("Çevrimdışısın", {
        description:
          "Görev hatırlatmaları yalnızca uygulama açık kalırsa tetiklenir. Sekmeyi kapatırsan bildirim gelmez.",
        icon: <BellOff className="w-4 h-4" />,
        duration: 7000,
      });
    }
    if (online) warnedRef.current = false;
  }, [online]);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-warning text-warning-foreground px-3 py-1.5 text-xs font-medium shadow-soft animate-fade-in"
    >
      <WifiOff className="w-3.5 h-3.5" />
      <span>Çevrimdışısın — veriler yerelden okunuyor, bildirimler yalnızca uygulama açıkken çalışır</span>
    </div>
  );
}
