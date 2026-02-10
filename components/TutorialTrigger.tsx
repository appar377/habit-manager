"use client";

import Link from "next/link";
import Button from "./ui/Button";

type Props = {
  label?: string;
  className?: string;
};

export default function TutorialTrigger({ label = "チュートリアル", className = "" }: Props) {
  return (
    <Link href="/tutorial">
      <Button
        type="button"
        variant="ghost"
        className={`min-h-[32px] px-2 text-xs text-fg-muted hover:text-foreground ${className}`}
      >
        {label}
      </Button>
    </Link>
  );
}
