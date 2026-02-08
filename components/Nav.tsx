"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * モバイル: 下固定タブ（親指圏・PWA想定）
 * PC (md+): 上固定に切替（重複を避ける）
 * iOS Safari: safe-area-inset-bottom を考慮
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
        className="hidden md:block fixed top-0 left-0 right-0 z-20 border-b border-neutral-200 dark:border-neutral-700 bg-background/95 backdrop-blur pt-[env(safe-area-inset-top)]"
      >
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-4">
          {TABS.map(({ href, label, aria }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex items-center justify-center min-h-[48px] text-sm font-medium transition-colors ${
                  isActive
                    ? "text-foreground font-semibold border-b-2 border-foreground -mb-[2px]"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
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

      {/* モバイル: 下固定・親指圏・iOS safe-area */}
      <nav
        role="navigation"
        aria-label="メイン"
        className="fixed bottom-0 left-0 right-0 z-20 md:hidden border-t border-neutral-200 dark:border-neutral-700 bg-background/95 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-around items-stretch h-14 min-h-[48px] max-w-lg mx-auto">
          {TABS.map(({ href, label, aria }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex-1 flex flex-col items-center justify-center min-w-0 min-h-[48px] text-sm font-medium active:opacity-80 transition-colors ${
                  isActive
                    ? "text-foreground font-semibold bg-neutral-100 dark:bg-neutral-800/80"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-foreground"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={aria}
              >
                <span className="block">{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-t" aria-hidden />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export const NAV_HEIGHT_PX = NAV_HEIGHT;
