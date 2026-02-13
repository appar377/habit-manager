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

**症状**: `manifest.webmanifest` が 401 (Unauthorized)、または本番で習慣の新規追加ができない。

**原因**: Vercel の **Deployment Protection**（パスワード保護・Vercel Authentication）が有効だと、認証前のリクエストが 401 になります。manifest の取得や、Cookie が付与される前の API がブロックされると、PWA のインストールや新規追加が失敗します。

**対処**:

1. [Vercel Dashboard](https://vercel.com) → 対象プロジェクト → **Settings** → **Deployment Protection**
2. **Production** で「Password Protection」や「Vercel Authentication」がオンなら、本番を公開する場合は **Off** にするか、必要なら「Protection Bypass for Automation」でバイパス用シークレットを設定する。

※ このリポジトリのミドルウェアは 401 を返していません。401 は Vercel の保護レイヤーで返されています。
