'use client';

import React from 'react';
import { DifficultyLevel } from '@/types/game';
import { sounds } from '@/lib/sounds';
import { ShieldAlert, Crosshair, Skull, Check, X } from 'lucide-react';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
  onSelectDifficulty,
}) => {
  if (!isOpen) return null;

  const handleSelect = (level: DifficultyLevel) => {
    sounds.playClick();
    onSelectDifficulty(level);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-frontier-wood border-2 border-frontier-brass rounded-2xl p-6 shadow-[0_0_50px_rgba(212,163,75,0.3)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-frontier-saddle">
          <div>
            <h2 className="text-xl font-bold font-serif text-frontier-parchment tracking-wide">
              Frontier Difficulty Level
            </h2>
            <p className="text-xs text-frontier-sepia font-serif">
              Choose your survival odds across the Solana wasteland
            </p>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-frontier-sepia hover:text-white hover:bg-frontier-leather transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Difficulty Cards */}
        <div className="space-y-3 my-5">
          {/* Easy */}
          <button
            onClick={() => handleSelect('Easy')}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
              currentDifficulty === 'Easy'
                ? 'border-emerald-500 bg-frontier-leather shadow-lg ring-1 ring-emerald-400'
                : 'border-frontier-saddle bg-frontier-dark hover:border-frontier-brass'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-white">Greenhorn (Easy)</span>
                {currentDifficulty === 'Easy' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-frontier-sepia font-serif mt-1">
                For newcomers. 120 Max HP, +20 Base Attack, 3 Starting Elixirs, and enemies deal 25% less damage.
              </p>
            </div>
          </button>

          {/* Middle */}
          <button
            onClick={() => handleSelect('Medium')}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
              currentDifficulty === 'Medium'
                ? 'border-frontier-gold bg-frontier-leather shadow-lg ring-1 ring-frontier-gold'
                : 'border-frontier-saddle bg-frontier-dark hover:border-frontier-brass'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-amber-950/80 text-frontier-gold border border-frontier-brass/50">
              <Crosshair className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-white">Gunslinger (Middle)</span>
                {currentDifficulty === 'Medium' && <Check className="w-4 h-4 text-frontier-gold" />}
              </div>
              <p className="text-xs text-frontier-sepia font-serif mt-1">
                The standard balanced challenge. 100 Max HP, +15 Base Attack, 2 Starting Elixirs, standard damage.
              </p>
            </div>
          </button>

          {/* Hard */}
          <button
            onClick={() => handleSelect('Hard')}
            className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-4 ${
              currentDifficulty === 'Hard'
                ? 'border-red-500 bg-frontier-leather shadow-lg ring-1 ring-red-400'
                : 'border-frontier-saddle bg-frontier-dark hover:border-frontier-brass'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-red-950/80 text-red-400 border border-red-500/40">
              <Skull className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-white">Desperado (Hard)</span>
                {currentDifficulty === 'Hard' && <Check className="w-4 h-4 text-red-400" />}
              </div>
              <p className="text-xs text-frontier-sepia font-serif mt-1">
                Lethal stakes. 75 Max HP, +12 Base Attack, 1 Starting Elixir, outlaws hit 35% harder!
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
