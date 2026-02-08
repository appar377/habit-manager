import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "習慣管理",
    short_name: "習慣",
    description: "予定チェックで完了管理・行動ログで振り返り",
    start_url: "/plan",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    background_color: "#ffffff",
    theme_color: "#171717",
    orientation: "portrait-primary",
    categories: ["productivity", "lifestyle"],
    icons: [
      { src: "/icon", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
