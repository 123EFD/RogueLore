import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Buffer } from 'buffer';
import { LootItem } from '@/types/game';

// Standard Solana Devnet RPC endpoint
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

// Necromancer treasury address on DevNet
export const NECROMANCER_VAULT = new PublicKey(
  '4ND1mBQtrMJVYVfKf2PJy9NZPdUZmG3nG97ao466CXpM'
);

// Solana Memo Program ID (standard on Mainnet and Devnet)
export const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
);

export function getSolanaConnection(): Connection {
  return new Connection(DEVNET_ENDPOINT, 'confirmed');
}

/**
 * Checks if the wallet has enough DevNet SOL to execute transactions
 */
export async function getWalletBalance(connection: Connection, pubkey: PublicKey): Promise<number> {
  try {
    const lamports = await connection.getBalance(pubkey);
    return lamports / LAMPORTS_PER_SOL;
  } catch (err) {
    console.error('Failed to get balance:', err);
    return 0;
  }
}

/**
 * Creates a transaction to revive the fallen player with 0.01 DevNet SOL
 */
export async function createReviveTransaction(
  playerPubkey: PublicKey,
  floor: number
): Promise<{ transaction: Transaction; blockhash: string; lastValidBlockHeight: number }> {
  const connection = getSolanaConnection();
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: playerPubkey,
  });

  // 1. Transfer 0.01 SOL to Necromancer Vault
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: playerPubkey,
      toPubkey: NECROMANCER_VAULT,
      lamports: Math.floor(0.01 * LAMPORTS_PER_SOL),
    })
  );

  // 2. Add On-Chain Memo marking the revival
  const memoText = `RogueLore::Revive::Floor:${floor}::Timestamp:${Date.now()}`;
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: playerPubkey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memoText, 'utf-8'),
    })
  );

  return { transaction, blockhash, lastValidBlockHeight };
}

/**
 * Creates an on-chain transaction to register & mint the AI-generated loot
 * directly onto the Solana ledger via the Memo program.
 */
export async function createMintLootTransaction(
  playerPubkey: PublicKey,
  loot: LootItem
): Promise<{ transaction: Transaction; blockhash: string; lastValidBlockHeight: number }> {
  const connection = getSolanaConnection();
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: playerPubkey,
  });

  const lootMetadata = JSON.stringify({
    app: 'RogueLore',
    action: 'MINT_LOOT',
    id: loot.id,
    name: loot.name,
    rarity: loot.rarity,
    type: loot.type,
    atk: loot.attackBonus,
    def: loot.defenseBonus,
    lore: loot.lore,
    emoji: loot.iconEmoji,
  });

  // Add on-chain signed Memo instruction containing the full loot metadata
  transaction.add(
    new TransactionInstruction({
      keys: [{ pubkey: playerPubkey, isSigner: true, isWritable: false }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(lootMetadata, 'utf-8'),
    })
  );

  return { transaction, blockhash, lastValidBlockHeight };
}

/**
 * Helper to get Solscan URL for a transaction
 */
export function getSolscanTxUrl(signature: string): string {
  return `https://solscan.io/tx/${signature}?cluster=devnet`;
}
