export default function AppIntro() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-xs text-center animate-intro-enter">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-soft">
          GP
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">Günlük Plan</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Haftanı planla, gününü takip et.</p>
        <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary animate-intro-progress" />
        </div>
      </div>
    </div>
  );
}
