This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 本番環境で 401 / 新規追加できない場合

**症状**:
- `GET .../manifest.webmanifest 401 (Unauthorized)`
- `Manifest fetch from ... failed, code 401`
- 本番で習慣の「新規追加」ができない・登録できない

**原因**: Vercel の **Deployment Protection**（パスワード保護・Vercel Authentication）が有効なため、認証前のリクエストが 401 になります。  
manifest の取得や、アプリ用 Cookie を付与する API がブロックされると、PWA のインストールや習慣の登録ができません。

**対処（必ず Vercel 側で行う）**:

1. [Vercel Dashboard](https://vercel.com) にログイン
2. 対象プロジェクト（habit-manager）を開く
3. 上部 **Settings** → 左メニュー **Deployment Protection**
4. **Production** の項目を確認:
   - **Vercel Authentication** または **Password Protection** が **On** になっている場合、本番を誰でも使えるようにするには **Off** に切り替える
5. 変更を保存し、本番 URL で再アクセスして manifest と新規追加が通るか確認する

※ このリポジトリのコードは 401 を返していません。401 は Vercel の保護機能が返しています。

**補足**:
- 「A listener indicated an asynchronous response...」はブラウザ拡張機能由来のエラーで、本アプリの不具合ではありません。
- プレビュー用 URL（`*-projects.vercel.app`）でも保護がかかっている場合は、上記で **Preview** の保護も Off にするか、本番ドメインで試してください。

## Application error: a server-side exception has occurred

**症状**: 本番で「Application error: a server-side exception has occurred」と表示され、ページが表示されない。

**主な原因**:

1. **環境変数 `DATABASE_URL` が未設定**  
   Vercel の **Settings** → **Environment Variables** で、本番（Production）に `DATABASE_URL`（Neon 等の接続文字列）を設定してください。
2. **Deployment Protection による 401**  
   上記「本番環境で 401 / 新規追加できない場合」のとおり、保護を Off にしてください。
3. **DB 接続・スキーマの失敗**  
   接続文字列の誤りや、DB 側の不具合で `ensureSchema()` が失敗している可能性があります。Vercel の **Deployments** → 該当デプロイ → **Functions** のログでスタックトレースを確認してください。

エラー発生時は、`app/error.tsx` または `app/global-error.tsx` で「再試行」ボタンが表示されます。
