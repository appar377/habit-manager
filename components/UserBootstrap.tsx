"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/signup"];

export default function UserBootstrap() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (AUTH_PATHS.some((p) => pathname?.startsWith(p))) {
      return;
    }
    const key = "hm_user_bootstrap_done";
    if (sessionStorage.getItem(key)) {
      return;
    }
    fetch("/api/user/ensure", { method: "POST" })
      .then((res) => {
        if (res.ok) {
          sessionStorage.setItem(key, "1");
          router.refresh();
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router, pathname]);

  return null;
}
