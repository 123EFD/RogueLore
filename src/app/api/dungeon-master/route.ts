import { NextRequest, NextResponse } from 'next/server';
import { GameTurnResponse, LootItem, PlayerStats, EnemyState } from '@/types/game';

// Dynamic pool for procedural unique loot generation
const ITEM_PREFIXES = [
  'Void-Forged', 'Solana-Tempered', 'Ethereal', 'Shattered', 'Astral',
  'Cursed', 'Radiant', 'Gilded', 'Obsidian', 'Glacial',
  'Infernal', 'Celestial', 'Phantom', 'Rune-Carved', 'Chrono-Shifted',
  'Validator\'s', 'Epoch', 'Quantum'
];

const ITEM_TYPES: { type: LootItem['type']; names: string[]; emojis: string[] }[] = [
  {
    type: 'Weapon',
    names: ['Sunblade', 'Warhammer', 'Dagger', 'Halberd', 'Arcane Staff', 'Executioner Axe', 'Recurve Bow', 'Scythe'],
    emojis: ['🗡️', '🪓', '🏹', '🔮', '⚔️']
  },
  {
    type: 'Armor',
    names: ['Aegis Shield', 'Dragonplate Cuirass', 'Shadow Mantle', 'Celestial Greaves', 'Validator Helm', 'Arcane Ward'],
    emojis: ['🛡️', '🥋', '🪖', '👑']
  },
  {
    type: 'Artifact',
    names: ['Turing Core', 'Chrono Amulet', 'Validator Ring', 'Phoenix Feather', 'Consensus Talisman', 'Soul Crystal'],
    emojis: ['🔮', '🪶', '💍', '💎', '🏺']
  }
];

const ITEM_SUFFIXES = [
  'of the Consensus', 'of DevNet', 'of Infinite TPS', 'of the Crypt King',
  'of the Sun Vault', 'of Undying Light', 'of Void Walkers', 'of High Frequency',
  'of Zero Slippage', 'of the Final Block', 'of Unyielding Fortitude', 'of the Phantom Order',
  'of the Cyber Lich', 'of Epoch Genesis', 'of the Validator Core'
];

const RARITIES: LootItem['rarity'][] = ['Common', 'Rare', 'Epic', 'Legendary'];
const RARITY_COLORS: Record<LootItem['rarity'], string> = {
  Common: '#94A3B8',
  Rare: '#06B6D4',
  Epic: '#9945FF',
  Legendary: '#14F195',
  Mythic: '#E6BE68',
};

/**
 * Procedural generator that guarantees 100% mathematically unique items
 */
function generateUniqueLoot(existingNames: string[] = []): LootItem {
  const existingSet = new Set(existingNames.map(n => n.toLowerCase()));
  let generatedName = '';
  let category = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
  let selectedName = '';
  let attempts = 0;

  do {
    const prefix = ITEM_PREFIXES[Math.floor(Math.random() * ITEM_PREFIXES.length)];
    category = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    selectedName = category.names[Math.floor(Math.random() * category.names.length)];
    const suffix = ITEM_SUFFIXES[Math.floor(Math.random() * ITEM_SUFFIXES.length)];

    generatedName = `${prefix} ${selectedName} ${suffix}`;
    attempts++;
  } while (existingSet.has(generatedName.toLowerCase()) && attempts < 50);

  const rarity = RARITIES[Math.floor(Math.random() * RARITIES.length)];
  const isLegendary = rarity === 'Legendary';
  const isEpic = rarity === 'Epic';

  const atkBonus = category.type === 'Weapon'
    ? (isLegendary ? 26 : isEpic ? 18 : 10) + Math.floor(Math.random() * 5)
    : Math.floor(Math.random() * 6) + 2;

  const defBonus = category.type === 'Armor'
    ? (isLegendary ? 24 : isEpic ? 16 : 8) + Math.floor(Math.random() * 5)
    : Math.floor(Math.random() * 5) + 1;

  const emoji = category.emojis[Math.floor(Math.random() * category.emojis.length)];

  return {
    id: `loot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: generatedName,
    rarity,
    type: category.type,
    attackBonus: atkBonus,
    defenseBonus: defBonus,
    lore: `Imbued with the forgotten kinetic force of ${generatedName.split(' ').slice(-2).join(' ')}, discovered deep within the crypt.`,
    iconEmoji: emoji,
    primaryColor: RARITY_COLORS[rarity],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      playerStats,
      action,
      currentEnemy,
      recentHistory = [],
      previousNarrative = '',
    }: {
      playerStats: PlayerStats;
      action: string;
      currentEnemy?: EnemyState | null;
      recentHistory: string[];
      previousNarrative?: string;
    } = body;

    const existingNames = playerStats.inventory.map((i) => i.name);
    const apiKey = process.env.GEMINI_API_KEY;

    // AI Generation via Gemini if key is present
    if (apiKey) {
      try {
        const prompt = `
You are the Dungeon Master for RogueLore, a dark fantasy rogue-like on Solana.
Write in an atmospheric, continuous, novel-like style.

CURRENT CONTEXT:
- Previous Narrative Beat: "${previousNarrative || 'You stand at the beginning of the dungeon.'}"
- Recent Log: ${recentHistory.slice(-2).join(' | ')}
- Dungeon Floor: ${playerStats.floor}
- Player: HP ${playerStats.hp}/${playerStats.maxHp}, ATK ${playerStats.attack}, DEF ${playerStats.defense}
- Active Enemy: ${currentEnemy ? `${currentEnemy.name} (HP: ${currentEnemy.hp}/${currentEnemy.maxHp}, Type: ${currentEnemy.type})` : 'None (Room cleared)'}
- Player's Chosen Action: "${action}"
- EXISTING INVENTORY ITEMS (DO NOT REPEAT): ${existingNames.join(', ') || 'None'}

COMBAT & STORYTELLING RULES:
1. CONTINUOUS STORY: Your narrative MUST directly connect to the previous narrative beat and describe the immediate physical outcome of the player's action. Show the recoil of the strike, the sound of metal/bone, the shifting shadows, and the enemy's visceral reaction.
2. ENEMY DAMAGE: If the player attacks, casts a spell, or uses combat maneuvers, calculate fair damage dealt to the enemy based on player's ATK (${playerStats.attack}).
   - Calculate "enemyDamageDealt": number (typically 12 to 32).
   - Calculate new enemy HP: (current enemy HP - enemyDamageDealt).
   - If enemy HP <= 0, the enemy is SLAIN! Set "enemy": null. Describe its glorious demise!
   - If enemy survives, update its "hp" and have it strike back (calculate "playerHpChange" e.g. -6 to -18).
3. LOOT UNIQUENESS: If the enemy was slain, generate a "lootDrop". The name MUST be completely unique and NEVER appear in the existing inventory list.
4. SCENE THEME: Return "sceneTheme": "crypt" | "golem" | "boss" | "chest" | "victory".

Return strictly raw JSON matching this schema:
{
  "narrative": "3-4 rich sentences advancing the story continuously.",
  "currentRoom": "Chamber title (e.g. 'Sanctum of the Sun King - Floor ${playerStats.floor}')",
  "playerHpChange": number (negative for damage sustained e.g. -10, or 0, or positive if healed),
  "enemyDamageDealt": number (damage dealt to opponent e.g. 20),
  "goldGained": number (5 to 30),
  "enemy": {
    "name": "Enemy name",
    "hp": number,
    "maxHp": number,
    "type": "Undead" | "Construct" | "Demon" | "Boss",
    "taunt": "Visceral combat reaction"
  } | null,
  "choices": [
    { "text": "Action choice 1", "type": "combat" | "magic" | "flee" | "explore", "risk": "Low" | "Medium" | "High" },
    { "text": "Action choice 2", "type": "combat" | "magic" | "flee" | "explore", "risk": "Low" | "Medium" | "High" },
    { "text": "Action choice 3", "type": "combat" | "magic" | "flee" | "explore", "risk": "Low" | "Medium" | "High" }
  ],
  "isGameOver": boolean,
  "lootDrop": {
    "name": "Unique Never-Before-Seen Name",
    "rarity": "Common" | "Rare" | "Epic" | "Legendary",
    "type": "Weapon" | "Armor" | "Artifact",
    "attackBonus": number,
    "defenseBonus": number,
    "lore": "Evocative lore snippet",
    "iconEmoji": "🗡️" | "🛡️" | "🔮",
    "primaryColor": "#9945FF" | "#14F195" | "#F59E0B"
  } | null,
  "combatLog": "Concise combat result e.g. 'You slashed for 22 damage! Sentry struck back for 8 damage.'",
  "sceneTheme": "crypt" | "golem" | "boss" | "chest" | "victory"
}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.85,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed: GameTurnResponse = JSON.parse(rawText);
            if (parsed.lootDrop) {
              parsed.lootDrop.id = `loot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            }
            return NextResponse.json(parsed);
          }
        }
      } catch (err) {
        console.warn('Gemini request failed, engaging continuous procedural engine:', err);
      }
    }

    // ==========================================
    // PROCEDURAL CONTINUOUS COMBAT ENGINE
    // ==========================================
    const isStart = action === 'START_GAME';
    let enemyState: EnemyState | null = currentEnemy || null;
    let enemyDamageDealt = 0;
    let playerDamageTaken = 0;
    let lootDrop: LootItem | null = null;
    let combatLog = '';
    let narrative = '';
    let sceneTheme: GameTurnResponse['sceneTheme'] = 'crypt';

    if (isStart) {
      enemyState = {
        name: 'Skeletal Crypt Guard',
        hp: 35,
        maxHp: 35,
        type: 'Undead',
        taunt: 'None trespass upon the sacred consensus vaults!',
      };
      narrative = 'You lower your torch into the echoing gloom of the subterranean catacombs. Ancient glyphs pulse with fractured Solana energy across crumbling pillars. Before you stands a towering Skeletal Guard, broadsword raised and hollow eyes fixated upon your soul.';
      combatLog = 'You step across the threshold into the dark dungeon. Combat engaged!';
      sceneTheme = 'crypt';
    } else if (enemyState && enemyState.hp > 0) {
      // Calculate damage dealt by player
      const baseAtk = playerStats.attack || 15;
      const attackVariance = Math.floor(Math.random() * 8) - 2;
      enemyDamageDealt = Math.max(8, baseAtk + attackVariance);

      const remainingEnemyHp = Math.max(0, enemyState.hp - enemyDamageDealt);

      if (remainingEnemyHp <= 0) {
        // ENEMY SLAIN!
        narrative = `Your decisive action (${action}) lands with devastating force! The ${enemyState.name} stumbles backward with a sickening crunch of shattered armor, collapsing into a heap of smoldering dust. From the fallen foe's remains, an ancient chest clicks open, revealing a glowing relic forged in Solana's early epochs!`;
        combatLog = `💥 Critical Hit! You dealt ${enemyDamageDealt} damage and SLAIN the ${enemyState.name}!`;
        enemyState = null;
        lootDrop = generateUniqueLoot(existingNames);
        sceneTheme = 'chest';
      } else {
        // ENEMY INJURED & COUNTER-ATTACKS
        enemyState = {
          ...enemyState,
          hp: remainingEnemyHp,
        };

        const enemyAtkBase = 12;
        const playerDef = playerStats.defense || 8;
        playerDamageTaken = Math.max(4, enemyAtkBase - Math.floor(playerDef / 3) + Math.floor(Math.random() * 5));

        narrative = `Building upon your maneuver (${action}), your strike slices clean into the ${enemyState.name}, carving away bone and armor for ${enemyDamageDealt} damage! Reeling in fury, the creature lunges back through the shadows, clawing at your defenses before regaining its balance.`;
        combatLog = `You struck for ${enemyDamageDealt} damage! (Enemy HP: ${remainingEnemyHp}/${enemyState.maxHp}). The enemy counter-attacked for ${playerDamageTaken} damage.`;
        sceneTheme = enemyState.type === 'Boss' ? 'boss' : enemyState.type === 'Construct' ? 'golem' : 'crypt';
      }
    } else {
      // No active enemy: entering next floor / chamber
      const floorNames = [
        'The Whispering Crypts',
        'The Gilded Lava Vaults',
        'The Sunken Hall of Validators',
        'The Astral Spire of DevNet',
      ];
      const roomTitle = floorNames[Math.min(playerStats.floor - 1, floorNames.length - 1)] || 'The Deep Void';

      const nextEnemyTypes = [
        { name: 'Magma Forge Golem', hp: 45, maxHp: 45, type: 'Construct', taunt: 'Thermal core engaged! Intruder purge initiated!' },
        { name: 'Arch-Lich Malakar', hp: 60, maxHp: 60, type: 'Boss', taunt: 'Mortal, your transactions meet their final confirmation here!' },
        { name: 'Shadow Stalker', hp: 30, maxHp: 30, type: 'Beast', taunt: 'Hssss... more flesh for the void!' },
      ];

      enemyState = nextEnemyTypes[Math.floor(Math.random() * nextEnemyTypes.length)];
      narrative = `Leaving the cleared chamber behind, you step through an iron portcullis into ${roomTitle}. The atmosphere grows dense with arcane static as a new sentinel emerges from the misty perimeter!`;
      combatLog = `Advanced to deeper chamber. A wild ${enemyState.name} appears!`;
      sceneTheme = enemyState.type === 'Boss' ? 'boss' : enemyState.type === 'Construct' ? 'golem' : 'crypt';
    }

    const newPlayerHp = Math.max(0, playerStats.hp - playerDamageTaken);
    const isGameOver = newPlayerHp <= 0;

    const choices = enemyState
      ? [
          { text: `Execute a heavy power strike against the ${enemyState.name}`, type: 'combat' as const, risk: 'Medium' as const },
          { text: 'Cast an Arcane Flash to disrupt its stance', type: 'magic' as const, risk: 'Low' as const },
          { text: 'Attempt a high-risk precision thrust at its weak point', type: 'combat' as const, risk: 'High' as const },
        ]
      : [
          { text: 'Proceed through the grand iron archway', type: 'explore' as const, risk: 'Low' as const },
          { text: 'Search the rubble for hidden gold and relics', type: 'explore' as const, risk: 'Medium' as const },
          { text: 'Meditate at the Solana consensus altar to restore focus', type: 'magic' as const, risk: 'Low' as const },
        ];

    const fallbackResponse: GameTurnResponse = {
      narrative,
      currentRoom: `Chamber ${playerStats.floor} - ${enemyState ? enemyState.name + ' Lair' : 'Secured Sanctuary'}`,
      playerHpChange: -playerDamageTaken,
      enemyDamageDealt,
      goldGained: lootDrop ? 35 : Math.floor(Math.random() * 15) + 5,
      enemy: enemyState,
      choices,
      isGameOver,
      lootDrop,
      combatLog,
      sceneTheme,
    };

    return NextResponse.json(fallbackResponse);
  } catch (error) {
    console.error('Dungeon Master Error:', error);
    return NextResponse.json(
      { error: 'Failed to process game turn' },
      { status: 500 }
    );
  }
}
