import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Mono everywhere — the brand reads as a stat panel. JetBrains Mono with a
// system-mono fallback (see --font-mono in globals.css).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Zebra — Daily Logic Puzzle",
  description:
    "A daily competitive logic-grid puzzle. Solve against the clock, share the raw numbers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} h-full antialiased`}>
      <body className="bg-bg text-fg flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
