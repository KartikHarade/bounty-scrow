import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SECURE BOUNTY ESCROW // Monad Testnet",
  description:
    "An on-chain escrow platform for security bounties where organizations lock rewards in a Monad smart contract, researchers submit vulnerability findings, and approved findings release payouts directly.",
  keywords: ["Monad", "Web3", "Bug Bounty", "Escrow", "Smart Contract", "Security", "Crypto"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${orbitron.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-[#e0e0e0] font-mono selection:bg-[#00ff88] selection:text-black">
        <div className="scanlines" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
