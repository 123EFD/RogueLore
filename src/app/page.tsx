'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { InventoryModal } from '@/components/InventoryModal';
import { GameOverModal } from '@/components/GameOverModal';
import { ForgeModal } from '@/components/ForgeModal';
import { DifficultyModal } from '@/components/DifficultyModal';
import { LootCard } from '@/components/LootCard';
import { AsciiScreen } from '@/components/AsciiScreen';
import { PlayerStats, LootItem, EnemyState, GameChoice, DifficultyLevel } from '@/types/game';
import { sounds } from '@/lib/sounds';
import {
  Heart,
  Shield,
  Sword,
  Coins,
  Compass,
  Send,
  Loader2,
  Sparkles,
  Zap,
  Flame,
  Award,
  Terminal,
  FlaskConical,
  Anvil,
  RotateCcw,
} from 'lucide-react';

const getInitialStatsByDifficulty = (diff: DifficultyLevel = 'Medium'): PlayerStats => {
  switch (diff) {
    case 'Easy':
      return {
        name: 'Wanderer',
        hp: 120,
        maxHp: 120,
        attack: 20,
        defense: 12,
        floor: 1,
        gold: 50,
        potions: 3,
        difficulty: 'Easy',
        inventory: [],
        reviveCount: 0,
      };
    case 'Hard':
      return {
        name: 'Wanderer',
        hp: 75,
        maxHp: 75,
        attack: 12,
        defense: 5,
        floor: 1,
        gold: 25,
        potions: 1,
        difficulty: 'Hard',
        inventory: [],
        reviveCount: 0,
      };
    default:
      return {
        name: 'Wanderer',
        hp: 100,
        maxHp: 100,
        attack: 16,
        defense: 8,
        floor: 1,
        gold: 40,
        potions: 2,
        difficulty: 'Medium',
        inventory: [],
        reviveCount: 0,
      };
  }
};

const SAMPLE_TEST_PROMPTS = [
  'Slash with tempered blade directly at the enemy’s cracked chest',
  'Channel a blinding burst of solar magic to incinerate its defenses',
  'Shield-bash into its knees to shatter its stance, followed by a heavy strike',
  'Feint an overhead swing, then thrust my blade into its glowing core',
];

export default function Home() {
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => getInitialStatsByDifficulty('Medium'));
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  const [currentRoom, setCurrentRoom] = useState<string>('Crypt of Genesis - Chamber 1');
  const [narrative, setNarrative] = useState<string>(
    'You lower your lantern into the echoing gloom of the frontier catacombs. Ancient glyphs pulse with fractured Solana energy across crumbling pillars. Before you stands a towering Skeletal Guard, broadsword raised and hollow eyes fixated upon your soul.'
  );
  const [enemy, setEnemy] = useState<EnemyState | null>({
    name: 'Skeletal Crypt Guard',
    hp: 35,
    maxHp: 35,
    type: 'Undead',
    taunt: 'None trespass upon the sacred consensus vaults!',
  });
  const [sceneTheme, setSceneTheme] = useState<'crypt' | 'golem' | 'boss' | 'chest' | 'victory'>('crypt');

  const [choices, setChoices] = useState<GameChoice[]>([
    { text: 'Strike with your tempered blade', type: 'combat', risk: 'Medium' },
    { text: 'Cast an arcane ward to block and counter-thrust', type: 'magic', risk: 'Low' },
    { text: 'Dash into the shadows to ambush from behind', type: 'explore', risk: 'High' },
  ]);
  const [combatLogs, setCombatLogs] = useState<string[]>([
    'Encounter initiated. The Skeletal Crypt Guard raises its chipped broadsword.',
  ]);
  const [recentLootDrop, setRecentLootDrop] = useState<LootItem | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customAction, setCustomAction] = useState<string>('');

  // Modals state
  const [isInventoryOpen, setIsInventoryOpen] = useState<boolean>(false);
  const [isForgeOpen, setIsForgeOpen] = useState<boolean>(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);

  // Visual animations state
  const [isPlayerAttacking, setIsPlayerAttacking] = useState<boolean>(false);
  const [isEnemyAttacking, setIsEnemyAttacking] = useState<boolean>(false);
  const [isEnemyHit, setIsEnemyHit] = useState<boolean>(false);
  const [isPlayerHit, setIsPlayerHit] = useState<boolean>(false);
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [lastDamage, setLastDamage] = useState<number>(0);
  const [lastPlayerDamage, setLastPlayerDamage] = useState<number>(0);
  const [lastHeal, setLastHeal] = useState<number>(0);

  const logEndRef = useRef<HTMLDivElement>(null);

  // 1. LocalStorage Persistence: Load on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('roguelore_player_stats_v3');
      if (saved) {
        const parsed: PlayerStats = JSON.parse(saved);
        setPlayerStats(parsed);
      }
    } catch (e) {
      console.warn('Failed to load stats from localStorage:', e);
    } finally {
      setIsLoadedFromStorage(true);
    }
  }, []);

  // 1. LocalStorage Persistence: Save on update
  useEffect(() => {
    if (!isLoadedFromStorage) return;
    try {
      localStorage.setItem('roguelore_player_stats_v3', JSON.stringify(playerStats));
    } catch (e) {
      console.warn('Failed to save stats to localStorage:', e);
    }
  }, [playerStats, isLoadedFromStorage]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [combatLogs]);

  // 2. Healing Feature (Drink Vitality Elixir)
  const handleHeal = () => {
    if (isLoading || isGameOver) return;

    if (playerStats.hp >= playerStats.maxHp) {
      setCombatLogs((prev) => [...prev, '⚠️ Your Vitality is already at maximum capacity!']);
      sounds.playClick();
      return;
    }

    const hasPotion = playerStats.potions > 0;
    const hasGold = playerStats.gold >= 20;

    if (!hasPotion && !hasGold) {
      setCombatLogs((prev) => [...prev, '⚠️ No Elixirs remaining and insufficient Shards (need 20) to brew one!']);
      sounds.playClick();
      return;
    }

    sounds.playHeal();
    const healAmount = playerStats.difficulty === 'Easy' ? 50 : playerStats.difficulty === 'Hard' ? 25 : 35;
    const newHp = Math.min(playerStats.maxHp, playerStats.hp + healAmount);
    setLastHeal(healAmount);
    setIsHealing(true);
    setTimeout(() => setIsHealing(false), 900);

    setPlayerStats((prev) => ({
      ...prev,
      hp: newHp,
      potions: hasPotion ? prev.potions - 1 : prev.potions,
      gold: !hasPotion && hasGold ? prev.gold - 20 : prev.gold,
    }));

    setCombatLogs((prev) => [
      ...prev,
      `🧪 Drank Vitality Elixir! Restored +${healAmount} HP (HP: ${newHp}/${playerStats.maxHp}). ${
        hasPotion ? `${playerStats.potions - 1} elixirs left.` : 'Paid 20 Shards to brew.'
      }`,
    ]);
  };

  // 3. Combat Turn Execution
  const executeTurn = async (actionText: string) => {
    if (isLoading || isGameOver || !actionText.trim()) return;

    sounds.playAttack();
    setIsLoading(true);
    setRecentLootDrop(null);

    // 1. Trigger Player Lunge Attack Animation
    setIsPlayerAttacking(true);
    setTimeout(() => setIsPlayerAttacking(false), 500);

    try {
      const res = await fetch('/api/dungeon-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerStats,
          action: actionText,
          currentEnemy: enemy,
          recentHistory: combatLogs.slice(-3),
          previousNarrative: narrative,
        }),
      });

      if (!res.ok) throw new Error('Dungeon Master encountered an anomaly');

      const data = await res.json();

      // 2. Trigger enemy damage & recoil animation
      if (data.enemyDamageDealt && data.enemyDamageDealt > 0) {
        setLastDamage(data.enemyDamageDealt);
        setIsEnemyHit(true);
        setTimeout(() => setIsEnemyHit(false), 650);
      }

      // Calculate player damage taken (scaled by difficulty)
      const diffMultiplier = playerStats.difficulty === 'Hard' ? 1.35 : playerStats.difficulty === 'Easy' ? 0.75 : 1.0;
      const rawHpChange = data.playerHpChange || 0;
      const effectiveHpChange = rawHpChange < 0
        ? Math.min(Math.round((rawHpChange + Math.floor(playerStats.defense / 6)) * diffMultiplier), -2)
        : rawHpChange;

      const newHp = Math.max(0, Math.min(playerStats.maxHp, playerStats.hp + effectiveHpChange));

      // 3. If enemy survived and retaliated, trigger enemy lunge & player recoil
      if (effectiveHpChange < 0 && data.enemy) {
        setTimeout(() => {
          setIsEnemyAttacking(true);
          setTimeout(() => setIsEnemyAttacking(false), 450);

          setTimeout(() => {
            setLastPlayerDamage(Math.abs(effectiveHpChange));
            setIsPlayerHit(true);
            sounds.playDamage();
            setTimeout(() => setIsPlayerHit(false), 600);
          }, 150);
        }, 300);
      }

      // Handle unique Loot Drop
      let updatedInventory = [...playerStats.inventory];
      if (data.lootDrop) {
        updatedInventory.push(data.lootDrop);
        setRecentLootDrop(data.lootDrop);
        sounds.playLootFound();
      }

      // Advance floor if enemy died or room cleared
      const enemyDefeated = enemy !== null && data.enemy === null;
      const nextFloor = enemyDefeated ? playerStats.floor + 1 : playerStats.floor;

      // Update state
      setPlayerStats((prev) => ({
        ...prev,
        hp: newHp,
        gold: prev.gold + (data.goldGained || 5),
        floor: nextFloor,
        inventory: updatedInventory,
        attack: prev.attack + (data.lootDrop?.attackBonus ? Math.floor(data.lootDrop.attackBonus / 2) : 0),
        defense: prev.defense + (data.lootDrop?.defenseBonus ? Math.floor(data.lootDrop.defenseBonus / 2) : 0),
      }));

      setCurrentRoom(data.currentRoom || currentRoom);
      setNarrative(data.narrative);
      setEnemy(data.enemy);
      if (data.sceneTheme) {
        setSceneTheme(data.sceneTheme);
      }
      if (data.choices && data.choices.length > 0) {
        setChoices(data.choices);
      }

      // Append detailed combat events
      const newLogs = [...combatLogs];
      newLogs.push(`> ${actionText}`);
      if (data.combatLog) {
        newLogs.push(data.combatLog);
      } else if (data.enemyDamageDealt > 0) {
        newLogs.push(`⚔️ Struck foe for ${data.enemyDamageDealt} damage!`);
      }
      if (effectiveHpChange < 0) {
        newLogs.push(`🛡️ Sustained ${Math.abs(effectiveHpChange)} damage! (HP: ${newHp}/${playerStats.maxHp})`);
      }
      if (data.lootDrop) {
        newLogs.push(`🎁 Unlocked Unique Armory: ${data.lootDrop.name}!`);
      }
      setCombatLogs(newLogs);

      if (newHp <= 0 || data.isGameOver) {
        setIsGameOver(true);
        sounds.playGameOver();
      }
    } catch (err) {
      console.error(err);
      setCombatLogs((prev) => [...prev, '⚠️ The crypt tremors... please try again.']);
    } finally {
      setIsLoading(false);
      setCustomAction('');
    }
  };

  // 5. Alchemical Forge Combine Success
  const handleForgeSuccess = (consumedIds: string[], forgedItem: LootItem) => {
    const remaining = playerStats.inventory.filter((item) => !consumedIds.includes(item.id));
    const nextInventory = [forgedItem, ...remaining];

    setPlayerStats((prev) => ({
      ...prev,
      inventory: nextInventory,
      attack: prev.attack + Math.floor(forgedItem.attackBonus / 2),
      defense: prev.defense + Math.floor(forgedItem.defenseBonus / 2),
    }));

    setCombatLogs((prev) => [
      ...prev,
      `⚡ Alchemical Forge: Successfully transmuted [${forgedItem.name}]! Unlocked Special Skill: "${forgedItem.specialSkill}"`,
    ]);
  };

  // 4. Change Difficulty
  const handleSelectDifficulty = (newDiff: DifficultyLevel) => {
    const freshStats = getInitialStatsByDifficulty(newDiff);
    setPlayerStats(freshStats);
    setCurrentRoom('Crypt of Genesis - Chamber 1');
    setNarrative('You embark onto the frontier trail afresh under the selected difficulty.');
    setEnemy({
      name: 'Skeletal Crypt Guard',
      hp: 35,
      maxHp: 35,
      type: 'Undead',
      taunt: 'None trespass upon the sacred consensus vaults!',
    });
    setCombatLogs([`Difficulty switched to ${newDiff}. Good luck, wanderer!`]);
    setRecentLootDrop(null);
  };

  const handleReviveSuccess = () => {
    setIsGameOver(false);
    setPlayerStats((prev) => ({
      ...prev,
      hp: 50,
      reviveCount: prev.reviveCount + 1,
    }));
    setCombatLogs((prev) => [
      ...prev,
      '⚡ The Necromancer accepted your 0.01 DevNet SOL! Your soul is reconstituted with 50 HP!',
    ]);
  };

  const handleRestart = () => {
    setIsGameOver(false);
    const resetStats = getInitialStatsByDifficulty(playerStats.difficulty);
    setPlayerStats(resetStats);
    setCurrentRoom('Crypt of Genesis - Chamber 1');
    setNarrative('You awaken at the dungeon entrance, your mortal spirit reconstituted.');
    setEnemy({
      name: 'Skeletal Crypt Guard',
      hp: 35,
      maxHp: 35,
      type: 'Undead',
      taunt: 'None trespass upon the sacred consensus vaults!',
    });
    setSceneTheme('crypt');
    setCombatLogs(['The frontier run begins anew.']);
    setRecentLootDrop(null);
  };

  const handleUpdateItem = (updated: LootItem) => {
    setPlayerStats((prev) => ({
      ...prev,
      inventory: prev.inventory.map((item) => (item.id === updated.id ? updated : item)),
    }));
    if (recentLootDrop && recentLootDrop.id === updated.id) {
      setRecentLootDrop(updated);
    }
  };

  const hpPercent = (playerStats.hp / playerStats.maxHp) * 100;
  const hpBarColor =
    hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 25 ? 'bg-frontier-gold' : 'bg-red-600';

  return (
    <div className="min-h-screen flex flex-col bg-frontier-dark text-frontier-parchment font-serif">
      <Navbar
        inventory={playerStats.inventory}
        difficulty={playerStats.difficulty}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenForge={() => setIsForgeOpen(true)}
        onOpenDifficulty={() => setIsDifficultyOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        {/* Top Player HUD - Midwestern Frontier Saloon Style */}
        <section className="grid grid-cols-2 sm:grid-cols-6 gap-3 p-4 rounded-xl bg-frontier-wood/90 border-2 border-frontier-saddle shadow-2xl backdrop-blur-md">
          {/* Health Bar */}
          <div className="col-span-2 flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5 font-serif">
              <span className="flex items-center gap-1.5 text-red-400 uppercase tracking-wider">
                <Heart className="w-4 h-4 fill-red-500/20 text-red-500" /> Vitality
              </span>
              <span className="font-mono text-frontier-sepia">
                {playerStats.hp} / {playerStats.maxHp}
              </span>
            </div>
            <div className="h-3 w-full bg-frontier-dark rounded-full overflow-hidden border border-frontier-saddle">
              <div
                className={`h-full transition-all duration-500 rounded-full ${hpBarColor}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>

          {/* Attack */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-frontier-dark/80 border border-frontier-saddle">
            <div className="p-2 rounded-lg bg-amber-950/60 text-frontier-gold border border-frontier-brass/40">
              <Sword className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-frontier-sepia uppercase tracking-wider font-semibold font-mono">ATK</div>
              <div className="text-sm font-bold font-mono text-white">{playerStats.attack}</div>
            </div>
          </div>

          {/* Defense */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-frontier-dark/80 border border-frontier-saddle">
            <div className="p-2 rounded-lg bg-stone-900 text-cyan-400 border border-cyan-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-frontier-sepia uppercase tracking-wider font-semibold font-mono">DEF</div>
              <div className="text-sm font-bold font-mono text-white">{playerStats.defense}</div>
            </div>
          </div>

          {/* Healing Elixirs (Clickable to Heal!) */}
          <button
            onClick={handleHeal}
            disabled={isLoading || isGameOver || playerStats.hp >= playerStats.maxHp}
            className="flex items-center gap-3 p-2 rounded-lg bg-frontier-leather border border-frontier-brass/60 hover:brightness-110 active:scale-95 transition-all text-left shadow-sm disabled:opacity-50"
            title="Click to drink elixir and restore HP!"
          >
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 animate-pulse">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-300 uppercase tracking-wider font-bold font-mono">HEAL</div>
              <div className="text-xs font-bold text-white flex items-center gap-1 font-mono">
                {playerStats.potions} <span>Elixirs</span>
              </div>
            </div>
          </button>

          {/* Floor & Difficulty Badge */}
          <div className="col-span-2 sm:col-span-1 flex items-center gap-3 p-2 rounded-lg bg-frontier-dark/80 border border-frontier-saddle">
            <div className="p-2 rounded-lg bg-frontier-saddle text-frontier-gold border border-frontier-brass/40">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-frontier-sepia uppercase tracking-wider font-semibold font-mono">SECTOR</div>
              <div className="text-sm font-bold font-mono text-frontier-gold">#{playerStats.floor}</div>
            </div>
          </div>
        </section>

        {/* Central Game Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Left 2 Columns: ASCII Visual Screen, Narrative & Action Deck */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* 1. Dual-Sprite Animated Combat Arena */}
            <AsciiScreen
              roomName={currentRoom}
              enemy={enemy}
              theme={sceneTheme}
              isPlayerAttacking={isPlayerAttacking}
              isEnemyAttacking={isEnemyAttacking}
              isEnemyHit={isEnemyHit}
              isPlayerHit={isPlayerHit}
              isHealing={isHealing}
              damageValue={lastDamage}
              playerDamageValue={lastPlayerDamage}
              healValue={lastHeal}
              playerHp={playerStats.hp}
              playerMaxHp={playerStats.maxHp}
            />

            {/* Room Banner */}
            <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-frontier-leather border border-frontier-saddle text-xs">
              <div className="flex items-center gap-2 text-frontier-parchment font-medium">
                <span className="w-2 h-2 rounded-full bg-frontier-brass animate-ping" />
                <span>{currentRoom}</span>
              </div>
              <div className="flex items-center gap-1.5 text-frontier-gold font-mono font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>{playerStats.gold} Shards</span>
              </div>
            </div>

            {/* 2. Dungeon Master Chronicle (Continuous Story) */}
            <div className="p-6 rounded-xl bg-frontier-wood/95 border-2 border-frontier-saddle relative flex-1 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-frontier-saddle pb-2 font-serif">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-frontier-brass">
                    <Sparkles className="w-4 h-4 text-frontier-gold" />
                    <span>Frontier Chronicle & Lore</span>
                  </div>
                  <span className="text-[10px] font-mono text-frontier-sepia">Continuous Story Arc</span>
                </div>
                <p className="text-frontier-parchment text-sm sm:text-base leading-relaxed tracking-wide">
                  {narrative}
                </p>
              </div>

              {/* Loot Drop Spotlight */}
              {recentLootDrop && (
                <div className="mt-6 pt-6 border-t border-frontier-saddle animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-frontier-gold mb-2 font-serif">
                    <Award className="w-4 h-4 animate-bounce" />
                    <span>Bounty Claimed! Unique Armory Discovered:</span>
                  </div>
                  <LootCard
                    loot={recentLootDrop}
                    onMintSuccess={(updated) => handleUpdateItem(updated)}
                  />
                </div>
              )}
            </div>

            {/* 3. Action Choices & Healing Quick Bar */}
            <div className="space-y-3 font-serif">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-frontier-sepia">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-frontier-gold" />
                  <span>Choose Your Tactical Action:</span>
                </div>
                <button
                  onClick={handleHeal}
                  disabled={isLoading || isGameOver || playerStats.hp >= playerStats.maxHp}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline font-mono disabled:opacity-40"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  Drink Elixir (+35 HP)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {choices.map((choice, idx) => (
                  <button
                    key={idx}
                    disabled={isLoading || isGameOver}
                    onClick={() => executeTurn(choice.text)}
                    className="p-3.5 rounded-xl border border-frontier-saddle bg-frontier-leather/90 hover:border-frontier-brass hover:bg-frontier-saddle/80 text-left transition-all group flex flex-col justify-between gap-2 shadow-md disabled:opacity-50 active:scale-98"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-frontier-dark border border-frontier-saddle text-frontier-sepia group-hover:text-frontier-gold transition-colors font-mono">
                        {choice.type}
                      </span>
                      <span className={`text-[10px] font-mono ${
                        choice.risk === 'High'
                          ? 'text-red-400'
                          : choice.risk === 'Medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {choice.risk} Risk
                      </span>
                    </div>
                    <span className="text-xs font-medium text-frontier-parchment group-hover:text-white leading-snug">
                      {choice.text}
                    </span>
                  </button>
                ))}
              </div>

              {/* Sample Combat Prompts for Instant Testing */}
              <div className="pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-frontier-sepia font-semibold mb-1.5">
                  <Terminal className="w-3 h-3 text-frontier-brass" />
                  <span>Sample Combat Prompts (Click to test reducing opponent HP):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_TEST_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      disabled={isLoading || isGameOver}
                      onClick={() => {
                        setCustomAction(prompt);
                        executeTurn(prompt);
                      }}
                      className="text-[11px] py-1 px-2.5 rounded-lg border border-frontier-saddle bg-frontier-dark text-frontier-sepia hover:border-frontier-brass hover:text-frontier-gold transition-all disabled:opacity-40"
                    >
                      "{prompt}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Freeform Prompt Action */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeTurn(customAction);
                }}
                className="flex items-center gap-2 mt-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customAction}
                    onChange={(e) => setCustomAction(e.target.value)}
                    disabled={isLoading || isGameOver}
                    placeholder="Type ANY custom frontier action for the AI (e.g. 'Throw lantern oil and draw revolver')..."
                    className="w-full bg-frontier-dark border border-frontier-saddle focus:border-frontier-brass rounded-xl py-2.5 px-4 text-xs text-frontier-parchment placeholder-frontier-sepia/50 outline-none transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || isGameOver || !customAction.trim()}
                  className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-frontier-brass to-frontier-gold text-frontier-dark font-serif font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40 hover:brightness-110"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Strike</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Combat Log & Active Stats */}
          <div className="flex flex-col gap-4 font-serif">
            <div className="p-4 rounded-xl bg-frontier-wood/90 border-2 border-frontier-saddle flex-1 flex flex-col h-[580px] shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-frontier-saddle">
                <span className="text-xs font-bold uppercase tracking-wider text-frontier-brass">
                  Telegraph & Combat Log
                </span>
                <span className="text-[10px] font-mono text-frontier-sepia">Live Stream</span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs font-mono">
                {combatLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg leading-relaxed ${
                      log.startsWith('>')
                        ? 'text-frontier-gold bg-frontier-saddle/40 border border-frontier-brass/30'
                        : log.startsWith('🎁')
                        ? 'text-amber-300 bg-amber-950/40 border border-amber-500/30 font-bold'
                        : log.startsWith('💥') || log.startsWith('⚔️')
                        ? 'text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 font-bold'
                        : log.startsWith('🧪')
                        ? 'text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 font-bold'
                        : log.startsWith('⚡')
                        ? 'text-amber-300 bg-amber-950/50 border border-amber-500/40 font-bold'
                        : log.startsWith('🛡️')
                        ? 'text-red-400 bg-red-950/40 border border-red-900/40'
                        : 'text-frontier-sepia bg-frontier-dark/70'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>

            {/* Forge & Persistence Quick Info */}
            <div className="p-4 rounded-xl bg-frontier-leather border border-frontier-saddle text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-frontier-gold font-bold">
                  <Anvil className="w-4 h-4 text-frontier-brass" />
                  <span>Alchemical Forge Ready</span>
                </div>
                <button
                  onClick={() => setIsForgeOpen(true)}
                  className="text-[11px] underline text-frontier-parchment hover:text-white font-mono"
                >
                  Open Forge
                </button>
              </div>
              <p className="text-[11px] text-frontier-sepia leading-relaxed">
                Combine 2 armory pieces to unlock advanced skills like <em>Dead Man's Hand</em> or <em>Quickdraw Strike</em>. Run progress is automatically preserved in your browser.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Inventory / Armory Modal */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={playerStats.inventory}
        onUpdateItem={handleUpdateItem}
      />

      {/* Alchemical Forge Modal */}
      <ForgeModal
        isOpen={isForgeOpen}
        onClose={() => setIsForgeOpen(false)}
        inventory={playerStats.inventory}
        onForgeSuccess={handleForgeSuccess}
      />

      {/* Level Difficulty Modal */}
      <DifficultyModal
        isOpen={isDifficultyOpen}
        onClose={() => setIsDifficultyOpen(false)}
        currentDifficulty={playerStats.difficulty}
        onSelectDifficulty={handleSelectDifficulty}
      />

      {/* Game Over / Revive Modal */}
      <GameOverModal
        isOpen={isGameOver}
        floor={playerStats.floor}
        onReviveSuccess={handleReviveSuccess}
        onRestart={handleRestart}
      />
    </div>
  );
}
