import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "習慣管理",
  description: "予定チェックで完了管理・行動ログで振り返り",
  applicationName: "習慣管理",
  appleWebApp: {
    capable: true,
    title: "習慣",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#58cc02" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a18" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-[100dvh] font-sans antialiased bg-background text-foreground">
        <main className="mx-auto max-w-lg min-h-[100dvh] px-4 pt-4 pb-[calc(var(--nav-height)+env(safe-area-inset-bottom)+1rem)] md:pt-[calc(var(--nav-height)+env(safe-area-inset-top)+0.5rem)] md:pb-6">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
