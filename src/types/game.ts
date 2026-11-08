export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface LootItem {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  type: 'Weapon' | 'Armor' | 'Artifact' | 'Relic';
  attackBonus: number;
  defenseBonus: number;
  lore: string;
  iconEmoji: string;
  primaryColor: string;
  mintSignature?: string;
  mintedAt?: number;
  specialSkill?: string; // Advanced skill gained through alchemical forging
  isForged?: boolean;
}

export interface EnemyState {
  name: string;
  hp: number;
  maxHp: number;
  type: string;
  taunt?: string;
}

export interface GameChoice {
  text: string;
  type: 'combat' | 'flee' | 'explore' | 'magic' | 'gamble';
  risk: 'Low' | 'Medium' | 'High';
}

export interface GameTurnResponse {
  narrative: string;
  currentRoom: string;
  playerHpChange: number;
  enemyDamageDealt?: number;
  goldGained: number;
  enemy?: EnemyState | null;
  choices: GameChoice[];
  isGameOver: boolean;
  lootDrop?: LootItem | null;
  combatLog?: string;
  sceneTheme?: 'crypt' | 'golem' | 'boss' | 'chest' | 'victory';
}

export interface PlayerStats {
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  floor: number;
  gold: number;
  potions: number;
  difficulty: DifficultyLevel;
  inventory: LootItem[];
  reviveCount: number;
}
