# デザインシステム

UI の配色・余白・フォントを一箇所で管理し、今後の変更や拡張をしやすくするための構成です。

## 1. デザイントークン（単一の設計ソース）

**ファイル: `app/theme.css`**

すべての「見た目のルール」はここで定義します。

- **色**: `--color-bg`, `--color-fg`, `--color-border`, `--color-primary`, `--color-accent` など
- **余白**: `--space-1` ～ `--space-12`（8px ベース）
- **角丸**: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`
- **タイポグラフィ**: `--font-sans`, `--text-xs`, `--text-sm` など
- **コンポーネント用**: `--touch-min-h`（タップ領域の最小高さ）, `--input-px`（入力の横パディング）

配色を変えたいときは **`theme.css` の `:root` と `@media (prefers-color-scheme: dark)` だけを編集**すれば、アプリ全体に反映されます。

## 2. グローバル CSS との関係

**ファイル: `app/globals.css`**

- 先頭で `@import "./theme.css"` によりトークンを読み込む
- `@theme inline { ... }` で Tailwind のユーティリティ（`bg-background`, `text-fg-muted`, `border-border`, `rounded-lg` など）をトークンに紐づけている
- その下で `body` などのベーススタイルや、FullCalendar など機能別の上書きを記述

ベースの見た目は **theme.css**、それ以外のレイアウトやコンポーネント固有のスタイルは **globals.css** で管理する想定です。

## 3. UI プリミティブ（部品）

**ディレクトリ: `components/ui/`**

| コンポーネント | 役割 |
|----------------|------|
| `Button` | ボタン（variant: primary / secondary / ghost / danger） |
| `Card` | 枠＋背景のカード |
| `CheckCircle` | 完了チェック用の円 |
| `Input` | テキスト入力 |
| `Label` | フォームラベル |
| `Pressable` | 押下フィードバック用の土台 |
| `Select` | セレクトボックス |

これらは **デザイントークン（theme.css）や `@theme` で定義した Tailwind クラスのみ**を使ってスタイルしています。  
新しい画面やフォームを作るときは、まず `components/ui/` の部品を使い、足りない部分だけトークンに合わせてスタイルを足すと、統一感と拡張性を保てます。

## 4. 使い方の例

- **配色を変える**: `app/theme.css` の `--color-*` を変更
- **余白や角丸を変える**: `app/theme.css` の `--space-*`, `--radius-*` を変更
- **フォントを変える**: `app/theme.css` の `--font-sans` を変更
- **新規画面で部品を使う**: `import { Button, Input, Label, Card } from "@/components/ui"` で利用

ビジネスロジックは `components/` 直下や `app/` に、見た目のルールは `theme.css` と `components/ui/` に分離することを推奨します。
