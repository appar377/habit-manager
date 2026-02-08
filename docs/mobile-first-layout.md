# モバイルファースト レイアウト案

親指操作・スクロール最小・1画面1アクション・PWA を前提とした画面遷移とレイアウト。

---

## 1. 画面遷移（3タブ・スタックなし）

```
[記録]     [分析]     [予定]
  |          |          |
  v          v          v
/capture   /review    /plan
```

- **スタックなし**: タブ切り替えのみ。子画面（モーダル・詳細）は必要最小限。
- **トップ**: `/` は `/capture` にリダイレクト。毎日の入口は「記録」1つ。

---

## 2. 親指操作を前提としたゾーン

```
+----------------------------------+
|  読むだけ（見出し・日付）          |  ← 上部：視線のみ
+----------------------------------+
|  習慣チップ / 入力欄              |  ← 中間：たまにタップ
+----------------------------------+
|  [記録する] ボタン                 |  ← 親指圏（メインアクション）
+----------------------------------+
|  [記録] [分析] [予定]              |  ← 下固定タブ（親指で切り替え）
+----------------------------------+
     safe-area-inset-bottom
```

- **メインアクション**: 画面下 1/3。ボタンは min-height 48px、全幅。
- **タブ**: 下固定、高さ 56px + safe-area。各タブ min-width 80px、中央揃え。
- **入力**: 習慣チップ・数値は中央〜やや下に配置し、親指で届く範囲に収める。

---

## 3. 各画面の役割（1画面1アクション）

| 画面 | パス | 1アクション | スクロール |
|------|------|-------------|------------|
| **記録** | /capture | 「記録する」を押すまで | ほぼなし。今日のログは直近3件のみ表示 or 折りたたみ |
| **分析** | /review | 見るだけ（KPI + グラフ1本） | 1画面に収める。必要なら 1 回だけ |
| **予定** | /plan | 見るだけ（仮） | 1画面 |

---

## 4. 記録画面の構成（スクロール最小）

```
+----------------------------------+
|  2/1                             |  日付（1行）
+----------------------------------+
|  [Burpees] [Plank] [Study]       |  習慣チップ（1行・横スクロールなしで収まる数）
+----------------------------------+
|  セット × 回数                    |
|  [  10  ] × [  25  ]             |  入力（1ブロック）
+----------------------------------+
|  [    記録する    ]               |  メインCTA（親指圏）
+----------------------------------+
|  今日のログ（3件）                |  直近3件のみ。それ以上は「もっと見る」で別表示 or 省略
|  - Burpees 10×25                 |
|  - Study 90分                     |
+----------------------------------+
```

- 今日のログは **直近3件** まで同一画面に表示。4件以上は「3件表示 + リンク」で別画面 or スライドで展開。
- 「別の日で記録」はテキストリンクで折りたたみ。初期表示では出さない。

---

## 5. PWA 化の想定

| 項目 | 対応 |
|------|------|
| **manifest** | `manifest.webmanifest`。name, short_name, start_url, display: standalone, theme_color, background_color |
| **viewport** | width=device-width, initial-scale=1, viewport-fit=cover（ノッチ対応） |
| **theme-color** | meta theme-color（light/dark で切り替え可） |
| **アイコン** | 192x192, 512x512。apple-touch-icon |
| **メインコンテンツ** | 100dvh で高さ確保（アドレスバー非表示時も崩れない） |

---

## 6. コンポーネント方針

- **SafeArea**: 全画面をラップ。padding-bottom: env(safe-area-inset-bottom), padding-top: env(safe-area-inset-top)。main の pb はタブ高さ + safe-area。
- **BottomNav**: 下固定。高さ 56px + env(safe-area-inset-bottom)。各アイテム min-height 48px。
- **Capture**: フォーム + 今日のログ3件まで。それ以上は `slice(0, 3)` で表示し、「もっと」は今回はリンクのみ or なし。

---

## 7. まとめ

- 親指: タブと「記録する」を下に集約。入力は中央付近。
- スクロール: 記録は直近3件、分析は1画面に収める。
- 1画面1アクション: 記録＝記録する、分析＝見る、予定＝見る。
- PWA: manifest + viewport-fit=cover + theme-color + 100dvh。

---

## 8. 主要コンポーネントの TSX 例

### 8.1 Layout（PWA・safe-area）

```tsx
// app/layout.tsx
import type { Viewport } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-[100dvh] font-sans antialiased bg-background text-foreground">
        <main className="mx-auto max-w-lg min-h-[100dvh] px-4 pt-4 pb-[calc(56px+env(safe-area-inset-bottom)+1rem)]">
          {children}
        </main>
        <Nav />
      </body>
    </html>
  );
}
```

### 8.2 BottomNav（親指圏・タブ）

```tsx
// components/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/capture", label: "記録", aria: "記録する" },
  { href: "/review", label: "分析", aria: "分析を見る" },
  { href: "/plan", label: "予定", aria: "予定を見る" },
] as const;

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t ... bg-background/95 backdrop-blur"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="navigation"
      aria-label="メイン"
    >
      <div className="flex justify-around items-stretch h-14 min-h-[48px] max-w-lg mx-auto">
        {tabs.map(({ href, label, aria }) => {
          const isActive = pathname === href || (href !== "/capture" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex items-center justify-center min-h-[48px] text-sm font-medium ...`}
              aria-current={isActive ? "page" : undefined}
              aria-label={aria}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### 8.3 SafeArea（必要時のみラップ）

```tsx
// components/SafeArea.tsx
export default function SafeArea({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={className}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {children}
    </div>
  );
}
```

### 8.4 Capture 画面（1画面1アクション・直近3件）

```tsx
// app/capture/page.tsx（抜粋）
const CAPTURE_RECENT_LOGS = 3;

export default async function CapturePage() {
  const today = todayStr();
  const habits = sortHabitsByRecentUsage(store.listHabits(), store.listLogs());
  const todayLogs = store.listLogs(today);
  const recentLogs = todayLogs.slice(0, CAPTURE_RECENT_LOGS);

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-500 shrink-0">{today}</p>
      <LogForm habits={habits} defaultHabitId={habits[0]?.id ?? ""} />
      <section className="shrink-0">
        <h2 className="text-xs font-medium text-neutral-400 mb-2">
          今日のログ{todayLogs.length > CAPTURE_RECENT_LOGS ? `（直近${CAPTURE_RECENT_LOGS}件）` : ""}
        </h2>
        <LogList logs={recentLogs} habits={habits} />
      </section>
    </div>
  );
}
```

### 8.5 PWA manifest（app/manifest.ts）

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "習慣管理",
    short_name: "習慣",
    description: "行動ログ・習慣トラッキング",
    start_url: "/capture",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    orientation: "portrait",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon", purpose: "any" }],
  };
}
```
