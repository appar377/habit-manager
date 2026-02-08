import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          borderRadius: "24%",
          fontSize: 240,
          color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          fontWeight: 600,
        }}
      >
        習
      </div>
    ),
    { ...size }
  );
}
