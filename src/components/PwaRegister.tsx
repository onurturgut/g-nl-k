'use client';

import { useEffect } from 'react';
import { registerPwaServiceWorker } from '@/lib/registerPwa';

export default function PwaRegister() {
  useEffect(() => {
    void registerPwaServiceWorker();
  }, []);

  return null;
}
