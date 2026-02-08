"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * モバイル: 下固定タブ（ゲーム風・緑アクセント）
 * PC (md+): 上固定に切替
 */
const TABS = [
  { href: "/review", label: "分析", aria: "分析を見る" },
  { href: "/plan", label: "予定", aria: "予定を見る" },
  { href: "/habits", label: "習慣", aria: "習慣を管理" },
] as const;

const NAV_HEIGHT = 56;

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* PC (md+): 上固定 */}
      <nav
        role="navigation"
        aria-label="メイン"
        className="hidden md:block fixed top-0 left-0 right-0 z-20 border-b-2 border-border bg-bg-muted/95 backdrop-blur pt-[env(safe-area-inset-top)] shadow-[var(--shadow-card)]"
      >
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-4">
          {TABS.map(({ href, label, aria }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex items-center justify-center min-h-[48px] rounded-[var(--radius-lg)] text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-primary bg-primary-soft"
                    : "text-fg-muted hover:text-foreground hover:bg-bg-subtle"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={aria}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* モバイル: 下固定・親指圏 */}
      <nav
        role="navigation"
        aria-label="メイン"
        className="fixed bottom-0 left-0 right-0 z-20 md:hidden border-t-2 border-border bg-bg-muted/95 backdrop-blur shadow-[0_-2px 12px rgba(0,0,0,0.06)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-around items-stretch gap-1 max-w-lg mx-auto px-2 py-2">
          {TABS.map(({ href, label, aria }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex-1 flex flex-col items-center justify-center min-w-0 min-h-[48px] rounded-[var(--radius-lg)] text-sm font-semibold transition-colors ${
                  isActive
                    ? "text-primary bg-primary-soft"
                    : "text-fg-muted hover:text-foreground active:bg-bg-subtle"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={aria}
              >
                <span className="block">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export const NAV_HEIGHT_PX = NAV_HEIGHT;
