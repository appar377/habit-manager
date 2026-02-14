"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error.message, error.digest);
  }, [error]);

  return (
    <div className="min-h-[40dvh] flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-lg font-semibold text-foreground">エラーが発生しました</h1>
      <p className="text-sm text-fg-muted text-center max-w-sm">
        本番環境では Vercel の「Deployment Protection」をオフにしてください。また、環境変数
        <code className="mx-1 rounded bg-bg-muted px-1.5 py-0.5 text-xs">DATABASE_URL</code>
        が設定されているか確認してください。
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
      >
        再試行
      </button>
    </div>
  );
}
