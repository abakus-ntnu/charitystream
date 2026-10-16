import type { Metadata } from "next";
import { Onest } from "next/font/google";

import Providers from "./providers";

import "./globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Abakus veldedighetsfest",
  description: "Nettside for Abakus sin veldedighetsfest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb" className={onest.variable}>
      <body className="antialiased">
        <div id="app-root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
