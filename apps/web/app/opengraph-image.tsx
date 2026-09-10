import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Meu Dim — clareza para sair das dívidas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#0B1F3B",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "80px",
          width: "100%"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              color: "#34D399",
              display: "flex",
              fontSize: 34,
              fontWeight: 700
            }}
          >
            Meu Dim
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              letterSpacing: "-3px",
              lineHeight: 1.08,
              maxWidth: 980
            }}
          >
            Descubra onde seu dinheiro vai.
          </div>
          <div
            style={{
              color: "#C9D6E5",
              display: "flex",
              fontSize: 30
            }}
          >
            Diagnóstico gratuito e plano para sair da dívida.
          </div>
        </div>
      </div>
    ),
    size
  );
}
