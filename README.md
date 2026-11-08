# ⚔️ RogueLore: AI Dungeon Master on Solana

> **Hackathon Submission Tracks:**
> - 🎮 **Gaming Track:** Fantasy rogue-like RPG with true asset ownership, permadeath stakes, and in-game economy.
> - 🤖 **AI Track:** Dynamic AI Dungeon Master powered by Google Gemini, generating unscripted encounters, creative player freedom, and procedural loot.
> - 🌟 **Best Beginner Hack:** Built on Solana DevNet using clean, low-friction Web3 architecture without requiring complex Rust contracts.

---

## 📖 Overview

**RogueLore** is a high-stakes dungeon crawler blending generative AI storytelling with Solana's high-speed, low-cost blockchain. 

Players navigate a perilous subterranean labyrinth governed by an **AI Dungeon Master**. Unlike traditional static RPGs, players can either choose contextual tactical choices or enter freeform text actions to outsmart traps, converse with phantoms, and battle bosses. Defeating guardians yields **on-chain loot** minted directly to the player's Solana wallet, while falling in combat presents a forbidden pact: accept permadeath or bribe the **Solana Necromancer** with micro-SOL to resurrect!

---

## ⚡ Key Features

1. **AI Dungeon Master (Powered by Gemini Flash)**
   - Procedural room generation, environmental atmosphere, combat calculations, and monster dialogue.
   - Accepts both predefined tactical actions and open-ended creative roleplay prompts.
   - Built-in zero-latency fallback engine ensures the game never crashes during live demos or API outages.

2. **Zero-Asset Web3 Economy ($0 Cost to Build)**
   - No costly 3D modeling or pre-rendered textures. Employs a cyberpunk/dark-fantasy UI with dynamic SVG loot cards and real-time Web Audio 8-bit sound synthesis.
   - Real Solana DevNet integration for wallet connection (Phantom, Solflare, Backpack).

3. **On-Chain Loot Minting**
   - Legendary and Epic weapons/armor discovered in the crypt are permanently recorded on the Solana ledger via the SPL Memo program.
   - Each item includes verified on-chain metadata (name, lore, ATK/DEF modifiers, timestamp) with instant Solscan transaction verification links.

4. **"Necromancer's Bargain" Permadeath Loop**
   - When player HP drops to 0, players can choose permadeath or sign a **0.01 DevNet SOL** revival transaction to restore half HP and preserve their armory.

---

## 🛠️ Tech Stack

- **Frontend & Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons, Canvas Confetti
- **Audio:** Native Web Audio API sound synthesizer (0 external files)
- **AI Brain:** Google Gemini API (`gemini-2.5-flash` in JSON mode)
- **Blockchain:** Solana DevNet (`@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20+ or v22+
- A Solana DevNet wallet extension (e.g. [Phantom](https://phantom.app/) or [Solflare](https://solflare.com/))
- Free DevNet SOL from the [Solana Faucet](https://faucet.solana.com/)

### 2. Installation
```bash
# Clone and enter directory
cd RogueLore

# Install dependencies
npm install --legacy-peer-deps
```

### 3. Environment Variables (Optional)
Create a `.env.local` file:
```env
# Optional: If omitted, the game automatically uses its dynamic procedural dungeon generator
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
```

### 4. Run the Game
```bash
npm run dev
```
Open [http://localhost:3005](http://localhost:3005) in your browser.

---

## 🏆 Hackathon Demo Script (2-Minute Video Flow)

1. **Hook (0:00 - 0:25):** Introduce RogueLore. Connect Phantom wallet in the top right on Solana DevNet.
2. **AI Gameplay (0:25 - 0:50):** Demonstrate the AI Dungeon Master. Enter a custom creative action (e.g., *"I kick the brazier into the skeleton's face and leap behind the sarcophagus"*). Show the AI dynamically responding with custom narrative and combat damage.
3. **On-Chain Loot (0:50 - 1:20):** Slay the boss. Reveal the glowing loot card. Click **"Claim Loot to Solana Wallet"**, approve the zero-cost transaction, and open the Solscan link to prove on-chain provenance.
4. **Necromancer Revive (1:20 - 1:45):** Take lethal damage to trigger the Game Over screen. Click **"Bribe Necromancer (0.01 DevNet SOL)"**, sign the revival pact, and show the character returning to life.
5. **Conclusion (1:45 - 2:00):** Recap why Solana + AI make games better: instant micro-transactions, true asset ownership, and infinite replayability.
