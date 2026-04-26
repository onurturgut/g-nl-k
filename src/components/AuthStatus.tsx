'use client';

import { SignInButton, SignOutButton, UserButton, useUser } from '@clerk/nextjs';
import { ShieldCheck, User } from 'lucide-react';

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function AuthStatus() {
  if (!clerkEnabled) {
    return (
      <section className="glass rounded-2xl p-4 shadow-soft">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold">Hesap modu</h3>
            <p className="text-xs text-muted-foreground">Clerk anahtarları eklenmediği için local-user profili kullanılıyor.</p>
          </div>
        </div>
      </section>
    );
  }

  return <ClerkAuthStatus />;
}

function ClerkAuthStatus() {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) return null;

  return (
    <section className="glass rounded-2xl p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold">Kullanıcı hesabı</h3>
            <p className="text-xs text-muted-foreground">
              {isSignedIn ? `${user.fullName || user.primaryEmailAddress?.emailAddress} ile senkronize ediliyor.` : 'Giriş yaparak cihazlar arası senkronizasyonu aç.'}
            </p>
          </div>
        </div>
        {isSignedIn ? (
          <div className="flex items-center gap-2">
            <UserButton />
            <SignOutButton>
              <button className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted">
                Çıkış
              </button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="rounded-xl bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">
              Giriş yap
            </button>
          </SignInButton>
        )}
      </div>
    </section>
  );
}
