'use client';

import React, { useState } from 'react';
import { LootItem } from '@/types/game';
import { sounds } from '@/lib/sounds';
import confetti from 'canvas-confetti';
import { Anvil, X, Sparkles, Flame, Check, ArrowRight, Shield, Sword, Zap } from 'lucide-react';

interface ForgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: LootItem[];
  onForgeSuccess: (consumedIds: string[], forgedItem: LootItem) => void;
}

const ADVANCED_SKILLS = [
  "Dead Man's Hand: 25% chance to unleash 3x Critical True Damage",
  "Gunslinger's Quickdraw: Preemptive First Strike with +15 Attack",
  "Frontier Aegis: Absorbs a lethal blow once and restores +30 HP",
  "Consensus Overdrive: Bypasses 50% of monster armor and wards",
  "Ghost Town Mirage: Grants 30% chance to completely evade counter-attacks",
  "Solar Bullet: Searing plasma inflicts persistent burn damage each turn",
];

export const ForgeModal: React.FC<ForgeModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onForgeSuccess,
}) => {
  const [selectedId1, setSelectedId1] = useState<string | null>(null);
  const [selectedId2, setSelectedId2] = useState<string | null>(null);
  const [isForging, setIsForging] = useState(false);

  if (!isOpen) return null;

  const item1 = inventory.find((i) => i.id === selectedId1);
  const item2 = inventory.find((i) => i.id === selectedId2);

  const toggleSelect = (id: string) => {
    sounds.playClick();
    if (selectedId1 === id) {
      setSelectedId1(null);
    } else if (selectedId2 === id) {
      setSelectedId2(null);
    } else if (!selectedId1) {
      setSelectedId1(id);
    } else if (!selectedId2) {
      setSelectedId2(id);
    } else {
      setSelectedId2(id);
    }
  };

  const handleCombine = () => {
    if (!item1 || !item2) return;

    setIsForging(true);
    sounds.playForge();

    setTimeout(() => {
      const combinedAtk = Math.floor((item1.attackBonus + item2.attackBonus) * 1.25);
      const combinedDef = Math.floor((item1.defenseBonus + item2.defenseBonus) * 1.25);
      const chosenSkill = ADVANCED_SKILLS[Math.floor(Math.random() * ADVANCED_SKILLS.length)];

      const name1Part = item1.name.split(' ')[0];
      const name2Part = item2.name.split(' ').slice(1).join(' ');
      const forgedName = `Mythic ${name1Part} ${name2Part || 'Artifact'}`;

      const forgedItem: LootItem = {
        id: `forged_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: forgedName,
        rarity: 'Mythic',
        type: item1.type === 'Weapon' || item2.type === 'Weapon' ? 'Weapon' : 'Artifact',
        attackBonus: combinedAtk,
        defenseBonus: combinedDef,
        lore: `Alchemically fused in the Frontier Blacksmith by transmuting [${item1.name}] and [${item2.name}]. It hums with unyielding Solana power.`,
        iconEmoji: '⚡',
        primaryColor: '#e6be68',
        specialSkill: chosenSkill,
        isForged: true,
      };

      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4a34b', '#14F195', '#9945FF'],
      });

      onForgeSuccess([item1.id, item2.id], forgedItem);
      setSelectedId1(null);
      setSelectedId2(null);
      setIsForging(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-frontier-wood border-2 border-frontier-brass rounded-2xl p-6 shadow-[0_0_50px_rgba(212,163,75,0.25)] flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-frontier-saddle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-frontier-saddle text-frontier-gold border border-frontier-brass shadow-md">
              <Anvil className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-frontier-parchment tracking-wide">
                Frontier Alchemical Forge
              </h2>
              <p className="text-xs text-frontier-sepia font-serif">
                Transmute two armory pieces to forge a Mythic relic with advanced skills
              </p>
            </div>
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

        {/* Forge Crucible Preview */}
        <div className="my-4 p-4 rounded-xl bg-frontier-dark border border-frontier-saddle">
          <div className="text-xs font-serif uppercase tracking-wider text-frontier-brass mb-3 flex items-center justify-between">
            <span>Crucible Chambers (Select 2 Armory Items)</span>
            {item1 && item2 && (
              <span className="text-emerald-400 font-mono text-[11px] animate-pulse">
                ✓ Ready for Transmutation (+25% Stat Boost)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Slot 1 */}
            <div className={`p-3 rounded-lg border-2 border-dashed transition-all ${
              item1
                ? 'border-frontier-brass bg-frontier-leather/80'
                : 'border-frontier-saddle bg-frontier-wood/40 text-center py-6'
            }`}>
              {item1 ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-frontier-parchment font-serif">{item1.name}</span>
                    <span>{item1.iconEmoji}</span>
                  </div>
                  <div className="flex gap-3 text-[11px] font-mono text-emerald-400">
                    <span>+{item1.attackBonus} ATK</span>
                    <span>+{item1.defenseBonus} DEF</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-frontier-sepia/60 font-serif">Select First Armory Piece</div>
              )}
            </div>

            {/* Slot 2 */}
            <div className={`p-3 rounded-lg border-2 border-dashed transition-all ${
              item2
                ? 'border-frontier-brass bg-frontier-leather/80'
                : 'border-frontier-saddle bg-frontier-wood/40 text-center py-6'
            }`}>
              {item2 ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-frontier-parchment font-serif">{item2.name}</span>
                    <span>{item2.iconEmoji}</span>
                  </div>
                  <div className="flex gap-3 text-[11px] font-mono text-emerald-400">
                    <span>+{item2.attackBonus} ATK</span>
                    <span>+{item2.defenseBonus} DEF</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-frontier-sepia/60 font-serif">Select Second Armory Piece</div>
              )}
            </div>
          </div>

          {/* Combine Action Button */}
          <button
            onClick={handleCombine}
            disabled={!item1 || !item2 || isForging}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-frontier-brass via-frontier-gold to-frontier-brass text-frontier-dark font-serif font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-[0_2px_12px_rgba(212,163,75,0.4)]"
          >
            {isForging ? (
              <>
                <Flame className="w-5 h-5 text-red-700 animate-spin" />
                Forging Mythic Armory on the Anvil...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-frontier-dark" />
                Combine into Advanced Armory
              </>
            )}
          </button>
        </div>

        {/* Inventory Selection Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="text-xs font-serif uppercase tracking-wider text-frontier-sepia mb-2">
            Available Inventory ({inventory.length} items):
          </div>

          {inventory.length < 2 ? (
            <div className="py-8 text-center text-frontier-sepia/70 text-xs font-serif">
              You need at least 2 armory pieces to combine. Explore chambers and slay outlaws to plunder more loot!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {inventory.map((item) => {
                const isSelected = selectedId1 === item.id || selectedId2 === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleSelect(item.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-frontier-gold bg-frontier-saddle text-white shadow-md'
                        : 'border-frontier-saddle bg-frontier-dark/70 text-frontier-sepia hover:border-frontier-brass hover:text-frontier-parchment'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold font-serif">{item.name}</div>
                      <div className="flex gap-2 text-[10px] font-mono text-emerald-400 mt-0.5">
                        <span>+{item.attackBonus} ATK</span>
                        <span>+{item.defenseBonus} DEF</span>
                      </div>
                      {item.specialSkill && (
                        <div className="text-[10px] text-amber-300 font-serif italic mt-1 line-clamp-1">
                          ⚡ {item.specialSkill}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.iconEmoji}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-frontier-gold text-frontier-dark flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
