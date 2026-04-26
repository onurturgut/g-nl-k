import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Günlük Plan",
  description: "Görev, not, günlük ve bildirim odaklı kişisel planlama uygulaması",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Günlük Plan",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return content;
  }

  return (
    <ClerkProvider>
      {content}
    </ClerkProvider>
  );
}
