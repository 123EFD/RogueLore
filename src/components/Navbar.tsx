'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { sounds } from '@/lib/sounds';
import { Volume2, VolumeX, Backpack, Anvil, ShieldAlert } from 'lucide-react';
import { LootItem, DifficultyLevel } from '@/types/game';

// Dynamically import WalletMultiButton to prevent SSR hydration mismatch
const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

interface NavbarProps {
  inventory: LootItem[];
  difficulty: DifficultyLevel;
  onOpenInventory: () => void;
  onOpenForge: () => void;
  onOpenDifficulty: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  inventory,
  difficulty,
  onOpenInventory,
  onOpenForge,
  onOpenDifficulty,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'Easy':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300';
      case 'Hard':
        return 'border-red-500/50 bg-red-950/40 text-red-300';
      default:
        return 'border-frontier-brass/50 bg-frontier-saddle/40 text-frontier-gold';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-frontier-saddle bg-frontier-wood/95 backdrop-blur-md px-4 lg:px-8 py-3 transition-all shadow-xl font-serif">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-frontier-saddle border-2 border-frontier-brass p-[2px] shadow-md flex items-center justify-center">
            <span className="font-serif font-black text-sm text-frontier-gold">
              RL
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider text-frontier-parchment">
                ROGUELORE
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-frontier-dark text-frontier-brass border border-frontier-brass/40">
                Solana DevNet
              </span>
            </div>
            <p className="text-[11px] text-frontier-sepia hidden sm:block">
              Frontier Dungeon Master • On-Chain Loot
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Difficulty Badge (Clickable to change) */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenDifficulty();
            }}
            title="Change Difficulty"
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-serif font-bold transition-all hover:scale-105 ${getDifficultyColor()}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{difficulty}</span>
          </button>

          {/* Alchemical Forge button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenForge();
            }}
            title="Combine Armory"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-frontier-brass/60 bg-frontier-leather text-xs font-serif font-bold text-frontier-gold hover:bg-frontier-saddle transition-all shadow-sm"
          >
            <Anvil className="w-4 h-4 text-frontier-gold" />
            <span className="hidden md:inline">Forge</span>
          </button>

          {/* Armory / Inventory button */}
          <button
            onClick={() => {
              sounds.playClick();
              onOpenInventory();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-frontier-saddle bg-frontier-dark text-xs font-serif font-bold text-frontier-parchment hover:border-frontier-brass transition-all shadow-sm"
          >
            <Backpack className="w-4 h-4 text-frontier-brass" />
            <span className="hidden sm:inline">Armory</span>
            {inventory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-frontier-brass/20 text-frontier-gold border border-frontier-brass/40 text-[10px] font-mono">
                {inventory.length}
              </span>
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 rounded-lg border border-frontier-saddle bg-frontier-dark text-frontier-sepia hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Connect Wallet */}
          <div className="solana-wallet-wrapper scale-90 sm:scale-100 origin-right">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    </header>
  );
};
