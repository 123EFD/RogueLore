'use client';

import React, { useState } from 'react';
import { LootItem } from '@/types/game';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createMintLootTransaction, getSolscanTxUrl, getWalletBalance } from '@/lib/solana';
import { sounds } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import { Sparkles, Shield, Sword, ExternalLink, Loader2, CheckCircle2, Zap } from 'lucide-react';

interface LootCardProps {
  loot: LootItem;
  onMintSuccess?: (updatedLoot: LootItem) => void;
}

export const LootCard: React.FC<LootCardProps> = ({ loot, onMintSuccess }) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getRarityBadge = (rarity: LootItem['rarity']) => {
    switch (rarity) {
      case 'Mythic':
        return 'border-frontier-gold text-frontier-gold bg-frontier-saddle/90 shadow-[0_0_20px_rgba(230,190,104,0.4)]';
      case 'Legendary':
        return 'border-amber-400 text-amber-300 bg-amber-950/70 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'Epic':
        return 'border-solana-purple text-purple-300 bg-purple-950/70 shadow-[0_0_15px_rgba(153,69,255,0.3)]';
      case 'Rare':
        return 'border-cyan-500 text-cyan-300 bg-cyan-950/70 shadow-[0_0_15px_rgba(6,182,212,0.3)]';
      default:
        return 'border-frontier-saddle text-frontier-sepia bg-frontier-dark/70';
    }
  };

  const handleMint = async () => {
    if (!publicKey) {
      setErrorMsg('Please connect your Solana wallet first!');
      sounds.playClick();
      return;
    }

    try {
      setIsMinting(true);
      setErrorMsg(null);
      sounds.playClick();

      // Check wallet balance for the tiny network fee (~0.000005 SOL)
      const balance = await getWalletBalance(connection, publicKey);
      if (balance <= 0.00001) {
        setErrorMsg('Wallet has 0 DevNet SOL! Get free test tokens at https://faucet.solana.com');
        setIsMinting(false);
        return;
      }

      const { transaction, blockhash, lastValidBlockHeight } = await createMintLootTransaction(publicKey, loot);
      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      sounds.playLootFound();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#d4a34b', '#14F195', '#9945FF'],
      });

      const updated = {
        ...loot,
        mintSignature: signature,
        mintedAt: Date.now(),
      };

      if (onMintSuccess) {
        onMintSuccess(updated);
      }
    } catch (err: unknown) {
      console.error('Minting error:', err);
      const message = (err as Error)?.message || 'Failed to mint on-chain';
      setErrorMsg(message);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 p-5 backdrop-blur-md transition-all duration-300 font-serif ${
      loot.rarity === 'Mythic'
        ? 'border-frontier-gold bg-gradient-to-b from-frontier-saddle/90 via-frontier-wood to-frontier-dark shadow-[0_0_30px_rgba(230,190,104,0.35)]'
        : loot.rarity === 'Legendary'
        ? 'border-frontier-brass bg-gradient-to-b from-amber-950/40 via-frontier-wood to-frontier-dark shadow-[0_0_20px_rgba(212,163,75,0.25)]'
        : 'border-frontier-saddle bg-frontier-wood/95'
    }`}>
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border font-mono ${getRarityBadge(loot.rarity)}`}>
          {loot.rarity} {loot.type}
        </span>
        <span className="text-3xl select-none filter drop-shadow-md">{loot.iconEmoji}</span>
      </div>

      {/* Item Title & Lore */}
      <h3 className="text-lg font-bold text-frontier-parchment tracking-wide mb-1 flex items-center gap-2">
        {loot.name}
        {(loot.rarity === 'Mythic' || loot.rarity === 'Legendary') && (
          <Sparkles className="w-4 h-4 text-frontier-gold animate-pulse" />
        )}
      </h3>
      <p className="text-xs text-frontier-sepia italic mb-3 leading-relaxed line-clamp-3">
        "{loot.lore}"
      </p>

      {/* Special Skill Trait (if forged) */}
      {loot.specialSkill && (
        <div className="mb-3 p-2 rounded-lg bg-frontier-dark border border-frontier-gold/50 flex items-start gap-2 text-xs">
          <Zap className="w-4 h-4 text-frontier-gold flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-frontier-gold uppercase text-[10px] tracking-wider block font-mono">
              Advanced Skill:
            </span>
            <span className="text-frontier-parchment text-[11px] leading-snug">
              {loot.specialSkill}
            </span>
          </div>
        </div>
      )}

      {/* Stats display */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-frontier-dark/80 p-2.5 rounded-lg border border-frontier-saddle">
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <Sword className="w-3.5 h-3.5" />
          <span>+{loot.attackBonus} ATK</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
          <Shield className="w-3.5 h-3.5" />
          <span>+{loot.defenseBonus} DEF</span>
        </div>
      </div>

      {/* Mint Actions */}
      {loot.mintSignature ? (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Recorded on Solana Ledger</span>
          </div>
          <a
            href={getSolscanTxUrl(loot.mintSignature)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-frontier-gold hover:text-frontier-parchment underline font-mono break-all transition-colors"
          >
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            View Solscan Transaction
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-frontier-brass via-frontier-gold to-frontier-brass text-frontier-dark font-serif font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_10px_rgba(212,163,75,0.3)] disabled:opacity-50"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Minting on Solana...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Claim to Solana Wallet
              </>
            )}
          </button>
          {errorMsg && (
            <p className="text-[11px] text-red-400 text-center leading-snug">{errorMsg}</p>
          )}
        </div>
      )}
    </div>
  );
};
