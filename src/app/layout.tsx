import type { Metadata } from 'next';
import './globals.css';
import { WalletContextProvider } from '@/components/WalletContextProvider';

export const metadata: Metadata = {
  title: 'RogueLore | AI Dungeon Master on Solana',
  description: 'An AI-powered fantasy rogue-like where your loot is minted directly to your Solana wallet.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-obsidian-950 text-slate-100 min-h-screen antialiased selection:bg-solana-purple selection:text-white">
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
