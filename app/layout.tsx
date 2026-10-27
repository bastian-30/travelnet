import type { Metadata } from "next";
import "../src/index.css";
import { Providers } from "./providers";
import Navbar from "../src/components/Navbar";
import AuthGate from "../src/components/AuthGate";

export const metadata: Metadata = {
  title: "TravelNet — Tu Ventana al Turismo",
  description: "Descubre Nicaragua: destinos, departamentos, reseñas y transmisiones en vivo.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <div className="min-h-screen" style={{ background: "#050D28" }}>
            <Navbar />
            <AuthGate>{children}</AuthGate>
          </div>
        </Providers>
      </body>
    </html>
  );
}
