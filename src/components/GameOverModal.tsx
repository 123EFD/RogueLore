'use client';

import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createReviveTransaction, getSolscanTxUrl, getWalletBalance } from '@/lib/solana';
import { sounds } from '@/lib/sounds';
import { Skull, Flame, RotateCcw, Loader2, ExternalLink } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  floor: number;
  onReviveSuccess: () => void;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  floor,
  onReviveSuccess,
  onRestart,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isReviving, setIsReviving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastReviveTx, setLastReviveTx] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayRevive = async () => {
    if (!publicKey) {
      setErrorMsg('Connect your Solana wallet to strike a frontier resurrection pact!');
      sounds.playClick();
      return;
    }

    try {
      setIsReviving(true);
      setErrorMsg(null);
      sounds.playClick();

      const balance = await getWalletBalance(connection, publicKey);
      if (balance < 0.01) {
        setErrorMsg('Insufficient DevNet SOL! You need 0.01 SOL. Grab free tokens at https://faucet.solana.com');
        setIsReviving(false);
        return;
      }

      const { transaction, blockhash, lastValidBlockHeight } = await createReviveTransaction(publicKey, floor);
      const signature = await sendTransaction(transaction, connection);

      await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      setLastReviveTx(signature);
      sounds.playRevive();
      setTimeout(() => {
        onReviveSuccess();
      }, 1000);
    } catch (err: unknown) {
      console.error('Revive error:', err);
      setErrorMsg((err as Error)?.message || 'Transaction failed or rejected');
    } finally {
      setIsReviving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300 font-serif">
      <div className="relative w-full max-w-lg bg-frontier-wood border-2 border-red-800/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(185,28,28,0.3)] text-center">
        {/* Skull Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/80 border-2 border-red-700/60 flex items-center justify-center text-red-400 mb-4 animate-bounce">
          <Skull className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-black text-red-500 tracking-wider uppercase mb-1">
          Dead Man's Trail
        </h2>
        <p className="text-sm text-frontier-sepia mb-6">
          Your journey halted at <span className="text-white font-bold">Floor {floor}</span>.
          The harsh dust of the frontier claims another wanderer.
        </p>

        {/* Necromancer Offer */}
        <div className="bg-frontier-dark border-2 border-frontier-brass/50 rounded-xl p-4 mb-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Flame className="w-20 h-20 text-frontier-brass" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-frontier-gold animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-frontier-gold font-mono">
              The Necromancer's Bargain
            </span>
          </div>
          <p className="text-xs text-frontier-parchment leading-relaxed">
            Sacrifice <strong className="text-solana-green">0.01 DevNet SOL</strong> to the vault. 
            Your soul is resurrected with 50 HP and your forged armory is preserved.
          </p>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-400 mb-4 bg-red-950/40 p-2 rounded-lg border border-red-800/40">
            {errorMsg}
          </p>
        )}

        {lastReviveTx && (
          <div className="mb-4">
            <p className="text-xs text-emerald-400 font-medium font-mono">Bargain Accepted! Resurrecting...</p>
            <a
              href={getSolscanTxUrl(lastReviveTx)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-frontier-gold hover:underline font-mono mt-1"
            >
              <ExternalLink className="w-3 h-3" /> View On-Chain Pact
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayRevive}
            disabled={isReviving}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-frontier-brass via-frontier-gold to-frontier-brass text-frontier-dark font-serif font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_15px_rgba(212,163,75,0.4)] disabled:opacity-50"
          >
            {isReviving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing Frontier Resurrection Pact...
              </>
            ) : (
              <>
                <Flame className="w-4 h-4" />
                Bribe Necromancer (0.01 DevNet SOL)
              </>
            )}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onRestart();
            }}
            disabled={isReviving}
            className="w-full py-2.5 px-4 rounded-xl border border-frontier-saddle text-frontier-sepia hover:text-white hover:bg-frontier-leather font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Accept Defeat & Start New Run
          </button>
        </div>
      </div>
    </div>
  );
};
