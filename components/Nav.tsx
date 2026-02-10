"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/**
 * モバイル: 下固定タブ（ゲーム風・緑アクセント）
 * PC (md+): 上固定に切替。アクティブ時はスムーズなトランジション。
 */
const TABS = [
  { href: "/plan", label: "予定", aria: "今日の予定を見る" },
  { href: "/habits", label: "習慣", aria: "習慣を管理" },
  { href: "/review", label: "分析", aria: "分析を見る" },
  { href: "/ranking", label: "ランキング", aria: "ランキングを見る" },
  { href: "/settings", label: "設定", aria: "設定を開く" },
] as const;

const NAV_HEIGHT = 56;

function NavLink({
  href,
  label,
  aria,
  isActive,
  layoutId,
  className = "",
}: {
  href: string;
  label: string;
  aria: string;
  isActive: boolean;
  layoutId: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`nav-tab relative flex-1 flex items-center justify-center min-h-[48px] min-w-0 rounded-[var(--radius-lg)] text-sm font-semibold ${
        isActive ? "nav-tab-active text-primary" : "text-fg-muted hover:text-foreground hover:bg-bg-subtle"
      } ${className}`}
      aria-current={isActive ? "page" : undefined}
      aria-label={aria}
    >
      {isActive && (
        <motion.span
          layoutId={layoutId}
          className="nav-tab-glow absolute inset-0 rounded-[var(--radius-lg)] bg-primary-soft -z-10"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="block">{label}</span>
    </Link>
  );
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <>
      {/* PC (md+): 上固定 */}
      <nav
        role="navigation"
        aria-label="メイン"
        className="nav-dock hidden md:block fixed top-0 left-0 right-0 z-20 border-b-2 border-border bg-bg-muted/90 backdrop-blur pt-[env(safe-area-inset-top)]"
      >
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto px-4">
          {TABS.map(({ href, label, aria }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              aria={aria}
              layoutId="nav-active-desktop"
              isActive={pathname === href || pathname.startsWith(href + "/")}
            />
          ))}
        </div>
      </nav>

      {/* モバイル: 下固定・親指圏 */}
      <nav
        role="navigation"
        aria-label="メイン"
        className="nav-dock fixed bottom-0 left-0 right-0 z-20 md:hidden border-t-2 border-border bg-bg-muted/90 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-around items-stretch gap-1 max-w-lg mx-auto px-2 py-2">
          {TABS.map(({ href, label, aria }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              aria={aria}
              layoutId="nav-active-mobile"
              isActive={pathname === href || pathname.startsWith(href + "/")}
              className="flex-col active:bg-bg-subtle"
            />
          ))}
        </div>
      </nav>
    </>
  );
}

export const NAV_HEIGHT_PX = NAV_HEIGHT;
