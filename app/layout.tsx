import type { Metadata } from "next";
import "./globals.css";
import "./editorial.css";
import "./motorcycle-story.css";

export const metadata: Metadata = {
  title: "Aventra · Cada kilómetro cuenta una historia",
  description: "Tu moto, su historia y la tranquilidad de seguir avanzando. Conoce Aventra, sus Rodadas y las funciones de la versión preliminar para Android.",
  openGraph: {
    title: "Aventra · Cada kilómetro cuenta una historia",
    description: "Tu moto, su historia y la tranquilidad de seguir avanzando. Conoce Aventra y sus Rodadas.",
    type: "website",
    locale: "es_CO",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
