'use client';

import React from 'react';
import { LootItem } from '@/types/game';
import { LootCard } from '@/components/LootCard';
import { sounds } from '@/lib/sounds';
import { X, Backpack, Sword, Shield } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: LootItem[];
  onUpdateItem: (item: LootItem) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onUpdateItem,
}) => {
  if (!isOpen) return null;

  const totalAtk = inventory.reduce((sum, item) => sum + item.attackBonus, 0);
  const totalDef = inventory.reduce((sum, item) => sum + item.defenseBonus, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-frontier-wood border-2 border-frontier-brass rounded-2xl p-6 shadow-2xl max-h-[85vh] flex flex-col font-serif">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-frontier-saddle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-frontier-saddle text-frontier-gold border border-frontier-brass shadow-md">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-frontier-parchment">Frontier Vault & Armory</h2>
              <p className="text-xs text-frontier-sepia">Armory plundered and recorded on Solana DevNet</p>
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

        {/* Total stats summary */}
        <div className="flex items-center gap-4 py-3 px-4 my-4 rounded-xl bg-frontier-dark border border-frontier-saddle">
          <span className="text-xs text-frontier-brass uppercase tracking-wider font-semibold font-mono">
            Equipped Modifiers:
          </span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <Sword className="w-4 h-4" />
            <span>+{totalAtk} ATK</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Shield className="w-4 h-4" />
            <span>+{totalDef} DEF</span>
          </div>
          <div className="ml-auto text-xs text-frontier-sepia">
            Total Items: <span className="font-bold text-frontier-parchment">{inventory.length}</span>
          </div>
        </div>

        {/* Item Grid */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {inventory.length === 0 ? (
            <div className="py-12 text-center text-frontier-sepia/70">
              <p className="text-sm">Your saddlebag is empty.</p>
              <p className="text-xs text-frontier-sepia/50 mt-1">Conquer outlaws and explore deeper to plunder on-chain loot.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inventory.map((item) => (
                <LootCard
                  key={item.id}
                  loot={item}
                  onMintSuccess={(updated) => onUpdateItem(updated)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
