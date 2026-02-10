"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserBootstrap() {
  const router = useRouter();

  useEffect(() => {
    const key = "hm_user_bootstrap_done";
    if (sessionStorage.getItem(key)) {
      return;
    }
    fetch("/api/user/ensure", { method: "POST" })
      .then(() => {
        sessionStorage.setItem(key, "1");
        router.refresh();
      })
      .catch(() => {});
  }, [router]);

  return null;
}
