'use client';

import React, { useEffect, useState } from 'react';
import { EnemyState } from '@/types/game';

interface AsciiScreenProps {
  roomName: string;
  enemy: EnemyState | null;
  theme?: 'crypt' | 'golem' | 'boss' | 'chest' | 'victory';
  isPlayerAttacking?: boolean;
  isEnemyAttacking?: boolean;
  isEnemyHit?: boolean;
  isPlayerHit?: boolean;
  isHealing?: boolean;
  damageValue?: number;
  playerDamageValue?: number;
  healValue?: number;
  playerHp?: number;
  playerMaxHp?: number;
}

export const AsciiScreen: React.FC<AsciiScreenProps> = ({
  roomName,
  enemy,
  theme = 'crypt',
  isPlayerAttacking = false,
  isEnemyAttacking = false,
  isEnemyHit = false,
  isPlayerHit = false,
  isHealing = false,
  damageValue = 0,
  playerDamageValue = 0,
  healValue = 0,
  playerHp = 100,
  playerMaxHp = 100,
}) => {
  const [idleFrame, setIdleFrame] = useState(0);

  // 2-Frame Retro Breathing & Lantern flicker timer (every 500ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setIdleFrame((prev) => (prev + 1) % 2);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Player 2-Frame ASCII Sprite (Frontier Wanderer)
  const getPlayerAscii = () => {
    if (isPlayerAttacking) {
      return `
       (====)
       ( o.O)  ⚔️ ===>
      /|====|\\====> 💥
     ( | W  | ) 
      /|    |\\ 
      `;
    }

    if (isPlayerHit) {
      return `
       (====)
       ( >.<)  💥
      /|====|\\
     ( | W  | )
      /      \\
      `;
    }

    if (idleFrame === 0) {
      return `
       (====)
       ( o.o)
      /|====|\\ ===>
     ( | W  | )
      /|    |\\
      `;
    }

    // Inhale frame
    return `
       (====)
       ( -.-)
      /|====|\\ ===>
     ( | W  | )
      /      \\
      `;
  };

  // Enemy 2-Frame ASCII Sprite
  const getEnemyAscii = () => {
    if (!enemy) return null;

    if (isEnemyAttacking) {
      return `
         💥 <=== ⚔️
         .-""""-.
        /_ (o)(o) _\\
          \\  /\\  /
          /|====|\\
         ( | EN | )
          /      \\
      `;
    }

    if (isEnemyHit) {
      return `
         💥
         .-""""-.
        /_ (X)(X) _\\
          \\  /\\  /
           '-..-'
          /|    |\\
      `;
    }

    if (theme === 'boss' || enemy.type === 'Boss') {
      return idleFrame === 0 ? `
           _ /\\ _
          /______\\
        .':(O)  (O):'.  🔮
        ::   ==   ::  /
        '.___\\/__.' /
        /|========|\\
       ( | ARCH-LICH )
      ` : `
           _ /\\ _
          /______\\
        .':(-)  (-):'.  🔮
        ::   ==   ::  /
        '.___\\/__.' /
        /|========|\\
       ( | ARCH-LICH )
      `;
    }

    if (theme === 'golem' || enemy.type === 'Construct') {
      return idleFrame === 0 ? `
        [==========]
       /  [o]  [o]  \\
      /|   ::LAVA::  |\\
     ( | [CORE: ON] | )
      \\|  8500 °C   |/
        \\==========/
      ` : `
        [==========]
       /  [-]  [-]  \\
      /|   ::LAVA::  |\\
     ( | [CORE: ON] | )
      \\|  8500 °C   |/
        \\==========/
      `;
    }

    // Default Outlaw Skeleton Guard
    return idleFrame === 0 ? `
         .-""""-.
        /  _  _  \\
       /_ (o)(o) _\\
         \\  /\\  /   <=== 🗡️
          '-..-'    /
         /|    |\\  /
        * |    | *
    ` : `
         .-""""-.
        /  _  _  \\
       /_ (-)(-) _\\
         \\  /\\  /   <=== 🗡️
          '-..-'    /
         /|    |\\  /
        * |    | *
    `;
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 font-mono text-xs select-none ${
        isEnemyHit && damageValue > 25
          ? 'animate-shake-heavy border-red-500 shadow-[0_0_35px_rgba(220,38,38,0.6)] bg-red-950/30'
          : isPlayerHit
          ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)] bg-red-950/30'
          : isHealing
          ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] bg-emerald-950/20'
          : isEnemyHit
          ? 'border-frontier-brass shadow-[0_0_25px_rgba(212,163,75,0.4)] bg-frontier-wood'
          : 'border-frontier-leather bg-frontier-wood/95 shadow-2xl'
      }`}
    >
      {/* Midwestern Frontier Woodgrain Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(212,163,75,0.08) 0px, rgba(212,163,75,0.08) 2px, transparent 2px, transparent 8px)',
        }}
      />

      {/* Saloon Header Ribbon */}
      <div className="flex items-center justify-between px-4 py-2 bg-frontier-leather border-b border-frontier-saddle text-[11px] text-frontier-sepia font-serif">
        <div className="flex items-center gap-2">
          <span className="text-frontier-brass">❖</span>
          <span className="font-bold uppercase tracking-widest text-frontier-brass">
            FRONTIER ARENA // {roomName}
          </span>
        </div>
        <div className="font-mono text-[10px] text-frontier-sepia tracking-wider">
          {enemy ? 'DUEL IN PROGRESS' : 'CHAMBER CLEARED'}
        </div>
      </div>

      {/* Main Dual-Sprite Interactive Combat Stage */}
      <div className="p-4 flex items-center justify-between min-h-[195px] relative px-6 sm:px-12">
        {/* --- LEFT SIDE: PLAYER WANDERER --- */}
        <div className="relative flex flex-col items-center">
          {/* Floating Heal / Damage Over Player */}
          {isHealing && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-float-up text-xs font-black font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50 shadow-lg whitespace-nowrap">
              +{healValue || 35} HP 💚
            </div>
          )}
          {isPlayerHit && playerDamageValue > 0 && (
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-float-up text-xs font-black font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-500/50 shadow-lg whitespace-nowrap">
              -{playerDamageValue} HP 💥
            </div>
          )}

          {/* Player Sprite with Lunge Animation */}
          <div
            className={`transition-all duration-300 ${
              isPlayerAttacking
                ? 'animate-lunge-right text-frontier-gold filter drop-shadow-[0_0_12px_rgba(230,190,104,0.7)]'
                : isPlayerHit
                ? 'text-red-400 -translate-x-3 filter drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                : isHealing
                ? 'text-emerald-400 filter drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                : 'text-frontier-parchment'
            }`}
          >
            <pre className="leading-tight font-mono text-[11px] sm:text-xs">
              {getPlayerAscii()}
            </pre>
          </div>

          {/* Player Mini Status */}
          <div className="mt-2 text-center">
            <span className="text-[10px] font-bold font-serif uppercase tracking-wider text-frontier-brass block">
              Wanderer (You)
            </span>
            <div className="w-16 sm:w-20 h-1.5 bg-frontier-dark rounded-full overflow-hidden border border-frontier-saddle mx-auto mt-1">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.max(0, (playerHp / playerMaxHp) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* --- CENTER: CLASH ZONE / IMPACT FX --- */}
        <div className="flex flex-col items-center justify-center px-2 z-10">
          {isPlayerAttacking && (
            <div className="text-center animate-slash">
              <span className="text-lg sm:text-2xl font-black font-mono text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                ⚔️ \\\\\\ 💥
              </span>
            </div>
          )}
          {isEnemyAttacking && (
            <div className="text-center animate-slash">
              <span className="text-lg sm:text-2xl font-black font-mono text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                💥 ////// ⚔️
              </span>
            </div>
          )}
          {!isPlayerAttacking && !isEnemyAttacking && enemy && (
            <div className="text-frontier-saddle/60 font-mono text-xs select-none">
              VS
            </div>
          )}
        </div>

        {/* --- RIGHT SIDE: OPPONENT (OR CHEST IF CLEARED) --- */}
        <div className="relative flex flex-col items-center">
          {enemy ? (
            <>
              {/* Floating Damage Over Enemy */}
              {isEnemyHit && damageValue > 0 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-float-up text-xs font-black font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 shadow-lg whitespace-nowrap">
                  {damageValue > 25 ? `CRIT! -${damageValue} 💥` : `-${damageValue} HP ⚔️`}
                </div>
              )}

              {/* Enemy Sprite with Lunge Animation */}
              <div
                className={`transition-all duration-300 ${
                  isEnemyAttacking
                    ? 'animate-lunge-left text-red-400 filter drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                    : isEnemyHit
                    ? 'text-red-400 translate-x-3 filter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                    : enemy.type === 'Boss'
                    ? 'text-frontier-gold filter drop-shadow-[0_0_8px_rgba(230,190,104,0.4)]'
                    : 'text-frontier-sepia'
                }`}
              >
                <pre className="leading-tight font-mono text-[11px] sm:text-xs">
                  {getEnemyAscii()}
                </pre>
              </div>

              {/* Enemy Mini Status */}
              <div className="mt-2 text-center">
                <span className="text-[10px] font-bold font-serif uppercase tracking-wider text-frontier-sepia block truncate max-w-[100px]">
                  {enemy.name}
                </span>
                <div className="w-16 sm:w-20 h-1.5 bg-frontier-dark rounded-full overflow-hidden border border-frontier-saddle mx-auto mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300"
                    style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* Chamber Cleared Treasure Display */
            <div className="text-center animate-in fade-in duration-300">
              <pre className="leading-tight font-mono text-[10px] sm:text-xs text-frontier-gold filter drop-shadow-[0_0_8px_rgba(230,190,104,0.5)]">
{`
     .--------.
    /  TREASURY\\
   +------------+
   | [ SOLANA ] | ✨
   |  VAULT #4  |
   +------------+
`}
              </pre>
              <span className="text-[10px] font-bold font-serif text-emerald-400 block mt-1">
                Bounty Plundered!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Saloon Footer Status */}
      {enemy ? (
        <div className="flex items-center justify-between px-4 py-2 bg-frontier-leather border-t border-frontier-saddle text-[11px] font-serif">
          <div className="flex items-center gap-2">
            <span className="text-frontier-brass">♦</span>
            <span className="text-frontier-sepia uppercase font-semibold">Target:</span>
            <span className="font-bold text-white tracking-wide">{enemy.name}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-frontier-wood text-frontier-brass border border-frontier-saddle font-mono">
              {enemy.type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-frontier-sepia font-mono">
              HP: {enemy.hp} / {enemy.maxHp}
            </span>
          </div>
        </div>
      ) : (
        <div className="px-4 py-2 bg-frontier-leather border-t border-frontier-saddle text-[11px] text-frontier-brass font-serif text-center">
          ♦ The duel is won! Advance to the next sector to claim deeper bounties. ♦
        </div>
      )}
    </div>
  );
};
