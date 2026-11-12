import { spawnSync } from "child_process";

const repo = "spoo-vault/spoovault";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const issues = [
  // ==========================================
  // 1. SOROBAN SMART CONTRACTS (1-10)
  // ==========================================
  {
    title: "[Soroban/Contracts] Batch Access Requests for Multiple Vaults",
    labels: ["enhancement", "soroban", "smart-contracts", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement \`batch_request_access\` in the core Soroban contract to allow beneficiaries to request access across multiple inherited vaults in a single transaction.

### Scope
- Add \`batch_request_access(e: Env, vault_ids: Vec<u64>, beneficiary: Address) -> Vec<bool>\` in \`contracts-stellar/src/lib.rs\`.
- Enforce caller authentication: \`beneficiary.require_auth()\`.
- Add comprehensive test cases in \`contracts-stellar/src/test.rs\`.
- Update frontend contract bindings in \`src/services/contract.service.ts\`.`
  },
  {
    title: "[Soroban/Contracts] Dynamic Storage Rent Calculation & TTL Warning Telemetry",
    labels: ["enhancement", "soroban", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Expose on-chain helper methods and RPC queries to accurately report instance and persistent entry TTLs, allowing callers to predict rent expiration.

### Scope
- Implement Soroban RPC \`getLedgerEntries\` parser for persistent storage TTL headers.
- Return remaining ledgers count and estimated rent expiration date.
- Add an automated rent warning threshold in the frontend dashboard (< 100,000 ledgers).`
  },
  {
    title: "[Soroban/Contracts] Upgradeable Contract Authorization via Multi-Sig Admin Quorum",
    labels: ["enhancement", "soroban", "governance", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement an upgrade mechanism (\`upgrade(e: Env, new_wasm_hash: BytesN<32>)\`) guarded by an M-of-N admin multi-signature threshold.

### Scope
- Store \`admin_quorum\` and registered admin addresses in instance storage.
- Require multi-party signatures before committing contract code updates.
- Emit \`ContractUpgraded(new_wasm_hash, timestamp)\` contract event.`
  },
  {
    title: "[Soroban/Contracts] Asset-Gated Vault Access Tokens using Soroban CAP-46 Token Interface",
    labels: ["enhancement", "soroban", "smart-contracts", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Enable creators to mint non-transferable access tickets (SBT-like) or require holding a specific Stellar Asset Contract (SAC) balance to view vault metadata.

### Scope
- Query external SAC token balances within Soroban contract using client cross-contract calls.
- Implement token-gated conditional unlock checks.
- Add unit tests validating insufficient token balance rejection.`
  },
  {
    title: "[Soroban/Contracts] Cross-Contract Access Verification Hook for External DAOs",
    labels: ["enhancement", "soroban", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow external DAO governance contracts on Stellar to register as guardians or emergency signers for organizational vaults.

### Scope
- Add \`register_dao_guardian(e: Env, vault_id: u64, dao_contract: Address)\`.
- Support custom account abstraction authorization signatures during approval flows.`
  },
  {
    title: "[Soroban/Contracts] Configurable Proof-of-Life Grace Period & Window Intervals",
    labels: ["enhancement", "soroban", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow vault creators to define dynamic heartbeat schedules (e.g. quarterly, bi-annual) with customizable grace periods before entering Emergency Mode.

### Scope
- Validate minimum (e.g. 7 days) and maximum (e.g. 5 years) heartbeat intervals.
- Add grace period parameter to \`create_vault\` signature.
- Test interval edge cases and boundary conditions.`
  },
  {
    title: "[Soroban/Contracts] Contract Event Emission Indexing with Bloom Filter Optimization",
    labels: ["enhancement", "soroban", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Standardize all emitted Soroban events with indexed topics (\`topics: (Symbol, Address, u64)\`) for high-throughput ingestion by indexers.

### Scope
- Standardize events for \`VaultCreated\`, \`HeartbeatRelayed\`, \`EmergencyModeTriggered\`, and \`AccessGranted\`.
- Ensure topics fit inside Soroban maximum event topic boundaries.`
  },
  {
    title: "[Soroban/Contracts] Soroban Contract Custom Error Enum Exhaustiveness",
    labels: ["enhancement", "soroban", "security", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Refactor contract error reporting from raw symbols to a strongly typed \`#[contracterror]\` enum with unique numeric error codes.

### Scope
- Replace generic errors with explicit codes: \`VaultNotFound = 1\`, \`AlreadyUnlocked = 2\`, \`UnauthorizedKeeper = 3\`, \`InsufficientQuorum = 4\`.
- Map contract errors to user-friendly messages in TypeScript SDK.`
  },
  {
    title: "[Soroban/Contracts] Transient Storage Compaction for Gas Cost Reduction",
    labels: ["enhancement", "soroban", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Optimize contract storage keys by using 32-bit compact identifiers instead of verbose symbols to minimize ledger read/write byte footprints.

### Scope
- Benchmark ledger footprint before and after key compaction.
- Ensure backwards compatibility for active contract instances.`
  },
  {
    title: "[Soroban/Contracts] On-Chain Curve25519 & Ed25519 Cryptographic Verification",
    labels: ["enhancement", "soroban", "crypto", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Integrate native Soroban environment crypto builtins for Ed25519 signature checks to verify off-chain keeper authorization tickets.

### Scope
- Use \`env.crypto().ed25519_verify()\` inside \`prove_life_by_keeper\`.
- Prevent replay attacks using monotonic sequence nonces.`
  },

  // ==========================================
  // 2. CRYPTO & ZERO-KNOWLEDGE SECURITY (11-20)
  // ==========================================
  {
    title: "[Crypto/Security] Zero-Knowledge Groth16 Proof of Beneficiary Identity",
    labels: ["crypto", "security", "privacy", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow beneficiaries to prove inclusion in a vault's inheritance list without revealing their public address or identity on-chain.

### Scope
- Generate snarkjs / Circom circuit for Merkle tree inclusion.
- Verify zk-SNARK proof client-side or via smart contract verifier.`
  },
  {
    title: "[Crypto/Security] Post-Quantum Hybrid Key Encapsulation (ML-KEM-768 + X25519)",
    labels: ["crypto", "security", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Add a post-quantum hybrid encryption layer combining NIST-standardized ML-KEM-768 (Kyber) with X25519 for future-proof document secrecy.

### Scope
- Implement client-side WebAssembly wrapper for ML-KEM-768.
- Encapsulate vault encryption keys with dual-layer security.`
  },
  {
    title: "[Crypto/Security] Timelock Secret Encryption using Verifiable Delay Functions (VDF)",
    labels: ["crypto", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Integrate Wesolowski VDF timelock encryption to guarantee documents remain decryptable even if all guardians disappear after expiration.

### Scope
- Build client-side VDF computation and verification worker.
- Provide backup recovery path when keeper and guardians are offline.`
  },
  {
    title: "[Crypto/Security] Proactive Secret Resharing (SSS) without Master Key Re-assembly",
    labels: ["crypto", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Enable vault owners to replace or rotate guardians by generating new Shamir polynomial shares without ever reconstructing the raw private key in browser memory.

### Scope
- Implement Feldman's Verifiable Secret Sharing or proactive resharing polynomials.
- Update guardian keys on IPFS with zero plaintext leakage.`
  },
  {
    title: "[Crypto/Security] OPAQUE PAKE Protocol Verification for Zero-Knowledge PIN Entry",
    labels: ["crypto", "security", "privacy", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement the OPAQUE password-authenticated key exchange (RFC 9807) to ensure local vault passcodes are never exposed to memory dump vulnerabilities.

### Scope
- Integrate \`@opaque/core\` inside \`src/services/sessionLock.service.ts\`.
- Add test coverage for invalid PIN lockout thresholds.`
  },
  {
    title: "[Crypto/Security] WebAuthn & Hardware Passkey Biometric Isolation",
    labels: ["crypto", "security", "keyring", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Support TouchID, FaceID, Windows Hello, and YubiKey WebAuthn credentials as primary or secondary signing factors for vault transactions.

### Scope
- Store WebAuthn credential IDs in encrypted IndexedDB.
- Sign ephemeral authorization payloads using navigator.credentials.get().`
  },
  {
    title: "[Crypto/Security] Argon2id Memory-Hardness Calibration Benchmark in Web Workers",
    labels: ["crypto", "performance", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Calibrate Argon2id memory (64MB vs 32MB) and iteration counts dynamically based on device capability (mobile vs desktop) to avoid browser thread freezing.

### Scope
- Implement a device benchmarking test inside \`CryptoWorkerService\`.
- Ensure derivation completes in under 1.2s across modern smartphones.`
  },
  {
    title: "[Crypto/Security] Constant-Time Cryptographic Comparison for Key Shares",
    labels: ["crypto", "security", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Prevent timing side-channel attacks during guardian shard reconstruction by implementing constant-time byte comparisons.

### Scope
- Audit all \`=== \` comparisons on private key hashes and MAC tags.
- Use \`crypto.subtle.timingSafeEqual\` or native constant-time equality utils.`
  },
  {
    title: "[Crypto/Security] Automated Ephemeral Memory Zeroization for Decrypted Buffers",
    labels: ["crypto", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Ensure that once decrypted document payloads are rendered or downloaded, their underlying Uint8Array memory buffers are immediately zero-wiped.

### Scope
- Add explicit \`.fill(0)\` zeroization hooks in \`DocumentPreviewModal\`.
- Verify memory garbage collection behavior with automated tests.`
  },
  {
    title: "[Crypto/Security] Cryptographic Merkle Proofs for Multi-Document Vault Manifests",
    labels: ["crypto", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Generate a Merkle tree of document hashes within a vault, storing only the Merkle root on Stellar Soroban to verify hundreds of files cost-effectively.

### Scope
- Implement Merkle tree generation using SHA-256.
- Allow beneficiaries to verify single document authenticity with a lightweight proof.`
  },

  // ==========================================
  // 3. STORAGE & IPFS RESILIENCE (21-30)
  // ==========================================
  {
    title: "[Storage/IPFS] Multi-Gateway Circuit Breaker with Dynamic Latency Scorer",
    labels: ["storage", "ipfs", "performance", "resilience", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement an adaptive multi-gateway circuit breaker that automatically routes IPFS fetches through the fastest, healthiest public or dedicated gateway.

### Scope
- Benchmark Pinata, Cloudflare, ipfs.io, and dweb.link latency in background.
- Fall back gracefully when a gateway returns HTTP 429 or 504.`
  },
  {
    title: "[Storage/IPFS] Web Streams Chunked Encryption for 100MB+ Large Files",
    labels: ["storage", "ipfs", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Use the Web Streams API to encrypt and upload files larger than 100MB in streaming chunks without crashing browser memory.

### Scope
- Implement \`TransformStream\` with AES-GCM streaming encryption.
- Provide real-time upload progress indicators in the UI.`
  },
  {
    title: "[Storage/IPFS] Arweave & Filecoin Dual Decentralized Archival Backup",
    labels: ["storage", "ipfs", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Add optional permanent storage redundancy by mirroring encrypted vault bundles to Arweave or Filecoin via Lighthouse.storage.

### Scope
- Add secondary archival gateway service in \`src/services/ipfs.service.ts\`.
- Store dual storage references (IPFS CID + Arweave TX ID) in vault manifest.`
  },
  {
    title: "[Storage/IPFS] Dynamic Client-Side Document Watermarking",
    labels: ["storage", "frontend", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Render dynamic, tamper-evident watermarks (beneficiary address + timestamp) on decrypted PDFs and images to deter unauthorized document distribution.

### Scope
- Use \`pdf-lib\` or HTML Canvas to overlay semi-transparent watermarks.
- Support toggleable watermark configuration during vault creation.`
  },
  {
    title: "[Storage/IPFS] Content Addressable CAR (Content Archive) Packaging",
    labels: ["storage", "ipfs", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Package multi-file vaults into standardized CAR files before uploading to IPFS to preserve folder structure and file hierarchy.

### Scope
- Integrate \`@ipld/car\` in client-side storage engine.
- Verify extraction speed and SHA-256 integrity on retrieval.`
  },
  {
    title: "[Storage/IPFS] Storage Quota Calculator & Cost Forecasting per Vault",
    labels: ["storage", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Display accurate real-time storage metrics (MB used, file count, estimated pinning duration) in the Vault creation wizard.

### Scope
- Calculate payload size after encryption overhead.
- Present visual storage bar indicators.`
  },
  {
    title: "[Storage/IPFS] Content Hash Deduplication across Vault Revisions",
    labels: ["storage", "ipfs", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Avoid redundant IPFS re-uploads when a user updates vault metadata by identifying unmodified files by their SHA-256 hash.

### Scope
- Cache local file hashes in IndexedDB.
- Skip uploading duplicates, linking existing CIDs instead.`
  },
  {
    title: "[Storage/IPFS] Offline Vault Cache via IndexedDB & Origin Private File System",
    labels: ["storage", "performance", "pwa", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Store encrypted vault previews and document thumbnails locally using OPFS / IndexedDB for instant zero-latency loading when offline.

### Scope
- Implement LRU cache eviction policy for local storage.
- Encrypt local cache with session-derived key.`
  },
  {
    title: "[Storage/IPFS] In-Browser Streaming Audio & Video Decryption",
    labels: ["storage", "frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow users to play encrypted voice memos, legal instructions, and video wills directly in-browser using MediaSource Extensions.

### Scope
- Stream decrypted chunks into MediaSource buffer.
- Add playback controls and seek support for large media files.`
  },
  {
    title: "[Storage/IPFS] Pinned Status Health Verifier and Pinata SLA Monitor",
    labels: ["storage", "ipfs", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Provide visual confirmation in the Documents table verifying that all files are actively pinned across multiple IPFS nodes.

### Scope
- Poll Pinata pin status API or query IPFS DHT for peer providers.
- Display green/yellow status badge in document row.`
  },

  // ==========================================
  // 4. STELLAR & WEB3 INTEGRATION (31-40)
  // ==========================================
  {
    title: "[Stellar/Web3] Horizon & Soroban RPC Automatic Fallback Provider Pooling",
    labels: ["stellar", "architecture", "resilience", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement an automatic RPC failover pool connecting to SDF Testnet, Blockdaemon, and QuickNode endpoints when one experiences rate limits or downtime.

### Scope
- Maintain array of RPC endpoints with automatic latency scoring.
- Switch seamlessly without interrupting user transactions.`
  },
  {
    title: "[Stellar/Web3] Freighter Wallet Account & Network Switch Event Listener",
    labels: ["stellar", "frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Listen to Freighter wallet account switching or network changing in real time and automatically refresh user session state.

### Scope
- Add listener using \`@stellar/freighter-api\`.
- Prompt user to reconnect if the network switches away from Testnet.`
  },
  {
    title: "[Stellar/Web3] Albedo Mobile QR Code Bridge for In-Person Key Ceremonies",
    labels: ["stellar", "frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow vault creators and guardians meeting in person to scan an Albedo QR code to sign guardian acceptance directly from mobile devices.

### Scope
- Generate dynamic Albedo QR bridge URL for \`accept_guardian\` invocations.
- Listen for callback confirmation and update UI state instantly.`
  },
  {
    title: "[Stellar/Web3] xBull Wallet Fee Delegation & Multi-Account Selector UI",
    labels: ["stellar", "frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Support xBull extension multi-account management and allow creators to sponsor beneficiary transaction fees.

### Scope
- Integrate xBull SDK connector in \`src/context/Web3Context.tsx\`.
- Add fee delegation options during access ticket redemption.`
  },
  {
    title: "[Stellar/Web3] Stellar Asset Contract (SAC) Native XLM Escrow Tracking",
    labels: ["stellar", "soroban", "frontend", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Track and display the contract's native XLM escrow reserves deposited for keeper automation rewards and storage rent.

### Scope
- Query contract XLM balance using Horizon \`accounts\` endpoint.
- Display total escrowed funds in the Analytics Dashboard.`
  },
  {
    title: "[Stellar/Web3] Dynamic Fee Estimation Buffer for Congested Ledgers",
    labels: ["stellar", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement dynamic transaction fee calculation that scales transaction inclusion fees smoothly during high ledger surge pricing.

### Scope
- Query Horizon \`fee_stats\` to get current median and surge pricing.
- Add user-selectable transaction priority (Slow, Normal, Fast).`
  },
  {
    title: "[Stellar/Web3] Automatic Session Disconnect on Account Invalidation",
    labels: ["stellar", "security", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Detect when a connected Stellar account has been merged, wiped, or locked, and disconnect active Web3 context safely.

### Scope
- Verify public key existence against Horizon on page mount.
- Display clean re-authentication banner if account state is invalid.`
  },
  {
    title: "[Stellar/Web3] Direct Mobile Deep-Link Schemes for Stellar Wallets",
    labels: ["stellar", "frontend", "pwa", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Generate SEP-0007 \`web+stellar\` deep links to launch native mobile Stellar wallets (Lobstr, Vibrant) for transaction signing.

### Scope
- Implement SEP-0007 URI generator for contract invocations.
- Test compatibility across mobile iOS and Android browsers.`
  },
  {
    title: "[Stellar/Web3] Stellar Claimable Balance Integration for Inheritance Funds",
    labels: ["stellar", "smart-contracts", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow vault creators to bundle an on-chain Stellar Claimable Balance (XLM or stablecoins) that unlocks automatically when the vault expires.

### Scope
- Create Claimable Balance with predicate: \`before_relative_time\` linked to Dead Man's timeout.
- Display linked funds in beneficiary claim portal.`
  },
  {
    title: "[Stellar/Web3] Testnet Friendbot Faucet Rate Limiter & Fallback Service",
    labels: ["stellar", "frontend", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Enhance testnet demo wallet funding with robust fallback handling when Friendbot rate limits are hit.

### Scope
- Handle HTTP 429 from Friendbot with exponential backoff.
- Display clear countdown timer until the faucet resets.`
  },

  // ==========================================
  // 5. FRONTEND & UI/UX EXCELLENCE (41-50)
  // ==========================================
  {
    title: "[Frontend/UI] Live Stellar Ledger TPS & Network Health Ticker in Header",
    labels: ["frontend", "ux", "stellar", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Add a sleek, animated network health bar in the application header showing live Stellar Testnet ledger sequence, average block time (5s), and RPC status.

### Scope
- Poll Soroban RPC \`getLatestLedger\` periodically.
- Display pulse indicator (green = healthy, yellow = degraded).`
  },
  {
    title: "[Frontend/UI] Ambient Interactive 3D Cryptographic Vault Hologram",
    labels: ["frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Upgrade the Landing Page hero visual with a responsive, GPU-accelerated 3D vault hologram using Three.js or Framer Motion 3D canvas.

### Scope
- Render interactive particle-based vault lock that reacts to mouse movement.
- Ensure 60fps performance with low CPU overhead.`
  },
  {
    title: "[Frontend/UI] Complete ARIA Accessibility & Keyboard Navigation Suite",
    labels: ["frontend", "accessibility", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Ensure 100% WCAG 2.1 AA compliance across all modals, form inputs, and navigation menus for screen reader and keyboard accessibility.

### Scope
- Add proper \`aria-labelledby\`, \`aria-describedby\`, and \`role=\"dialog\"\` attributes.
- Implement keyboard trap inside \`SessionLockModal\` and \`CreateVaultModal\`.`
  },
  {
    title: "[Frontend/UI] High-Contrast Dark & Cyber-Purple Theme System Sync",
    labels: ["frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Support smooth theme transitions between Cyber-Purple Dark Mode and OLED High-Contrast Mode with automatic OS system preference detection.

### Scope
- Store theme preference in \`localStorage\`.
- Ensure zero contrast ratio violations under Lighthouse audits.`
  },
  {
    title: "[Frontend/UI] Multi-Step Vault Creation Wizard with Auto-Draft Persistence",
    labels: ["frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Break down the vault creation flow into a clean 4-step wizard (Basic Info -> Documents -> Guardians -> Review) with local draft auto-saving.

### Scope
- Save form state to \`sessionStorage\` so users don't lose input on accidental refresh.
- Add progress bar indicator with step validation checks.`
  },
  {
    title: "[Frontend/UI] Mobile Slide Drawer Navigation & Swipe Gestures",
    labels: ["frontend", "ux", "pwa", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement smooth touch swipe-to-dismiss gestures for mobile bottom sheets and slide navigation drawers.

### Scope
- Integrate Framer Motion drag gestures with velocity-based snapping.
- Test fluid animation on mobile Safari and Chrome.`
  },
  {
    title: "[Frontend/UI] Real-Time Debounced Fuzzy Search across Vault Documents",
    labels: ["frontend", "performance", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement instant client-side fuzzy search across document titles, tags, and MIME types with a 150ms debounce.

### Scope
- Integrate lightweight Fuse.js or regex search utility.
- Highlight matching keyword characters in search results.`
  },
  {
    title: "[Frontend/UI] Centralized Toast Notification Manager & Activity Drawer",
    labels: ["frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Refactor scattered toast alerts into a unified Notification Center with transaction history, deduplication, and sound effects.

### Scope
- Prevent stacking more than 3 simultaneous toasts.
- Add slide-out Notification Drawer with persistent transaction history.`
  },
  {
    title: "[Frontend/UI] Dynamic Gravatar & Stellar Identicon Avatar Generation",
    labels: ["frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Generate deterministic cryptographic identicons for Stellar public keys in guardian lists and profile badges.

### Scope
- Generate SVG jazzicon / blockies based on account public key.
- Fallback gracefully when external image URLs fail.`
  },
  {
    title: "[Frontend/UI] Zero-Flicker Page Transitions with View Transitions API",
    labels: ["frontend", "ux", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement smooth, native browser page transitions using the modern View Transitions API with Framer Motion fallbacks.

### Scope
- Wrap route changes with \`document.startViewTransition\`.
- Ensure zero layout shift (CLS = 0) during route transitions.`
  },

  // ==========================================
  // 6. ANALYTICS & DASHBOARD (51-60)
  // ==========================================
  {
    title: "[Analytics/Dashboard] Visual Dead Man Countdown Radial Rings",
    labels: ["frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Display animated radial progress rings showing the remaining percentage of time before a vault's heartbeat expires.

### Scope
- Calculate elapsed vs remaining time dynamically.
- Change ring color dynamically (Green > 50%, Yellow 20-50%, Red < 20%).`
  },
  {
    title: "[Analytics/Dashboard] Real-Time Guardian Quorum Matrix Visualization",
    labels: ["frontend", "ux", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Create a visual approval matrix showing which guardians have submitted cryptographic approvals towards the required threshold quorum.

### Scope
- Display avatar chips for each guardian with approved / pending / rejected status.
- Show live progress bar towards threshold \`k-of-n\`.`
  },
  {
    title: "[Analytics/Dashboard] Export Tamper-Proof Audit Trail to Signed PDF Bundle",
    labels: ["frontend", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow auditors and compliance officers to download an immutable verification certificate of all vault lifecycle events.

### Scope
- Generate printable PDF bundle with Stellar transaction hashes and timestamps.
- Include QR code linking directly to Stellar Expert Explorer.`
  },
  {
    title: "[Analytics/Dashboard] Storage Usage Breakdown by File Format & Encryption",
    labels: ["frontend", "ux", "storage", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Provide donut chart visualization displaying total encrypted storage distributed across PDFs, images, credentials, and media files.

### Scope
- Parse document MIME types and sizes from vault state.
- Render clean responsive chart with Recharts or Chart.js.`
  },
  {
    title: "[Analytics/Dashboard] Network Fee Historical Comparison vs Traditional EVM",
    labels: ["frontend", "stellar", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Calculate and display cumulative dollar savings of using Stellar Soroban micro-fees ($0.0001) compared to equivalent Ethereum / Avalanche gas fees.

### Scope
- Benchmark total transaction count against average L1 gas prices.
- Display aggregate dollars saved metric card on Dashboard.`
  },
  {
    title: "[Analytics/Dashboard] Beneficiary Access Attempt Log with IP Anonymization",
    labels: ["security", "frontend", "privacy", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Log all attempted access requests in local audit logs while masking IP addresses to preserve privacy.

### Scope
- Record timestamp, wallet address, and verification outcome.
- Allow vault owners to review past access history.`
  },
  {
    title: "[Analytics/Dashboard] Web Push API Browser Inactivity Warning Notifications",
    labels: ["frontend", "ux", "pwa", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Prompt users to enable browser Web Push notifications to receive reminders 14 days before their heartbeat lapses.

### Scope
- Implement Service Worker push notification subscription.
- Schedule local alarms for offline reminders.`
  },
  {
    title: "[Analytics/Dashboard] Interactive Guardian Network Graph using D3 Force Layout",
    labels: ["frontend", "ux", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Render a force-directed network graph showing connections between vault owners, guardians, and beneficiaries.

### Scope
- Use D3.js or React Force Graph to visualize relationship topology.
- Add interactive zoom, node dragging, and tooltip inspection.`
  },
  {
    title: "[Analytics/Dashboard] CSV & Excel Export for Enterprise Vault Compliance",
    labels: ["frontend", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow organizational vault managers to export complete vault asset lists and guardian contact registries to CSV / Excel format.

### Scope
- Generate formatted CSV with proper headers and escaping.
- Support instant browser download.`
  },
  {
    title: "[Analytics/Dashboard] Micro-Chart Sparklines for Heartbeat Consistency",
    labels: ["frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Display inline mini sparklines illustrating historical heartbeat check-in punctuality over the last 12 months.

### Scope
- Render lightweight SVG sparkline inside Vault overview cards.
- Highlight gaps or near-expiration close calls.`
  },

  // ==========================================
  // 7. KEEPER & AUTOMATION INFRASTRUCTURE (61-70)
  // ==========================================
  {
    title: "[Keeper/Automation] Decentralized Off-Chain Relayer for Automated Heartbeats",
    labels: ["architecture", "stellar", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement an open-source lightweight Node.js / Rust keeper bot that monitors authorized vaults and relays heartbeats when authorized by owner API tokens.

### Scope
- Implement keeper worker daemon polling authorized vault timeouts.
- Sign and submit \`prove_life_by_keeper\` transactions on Stellar.`
  },
  {
    title: "[Keeper/Automation] Stellar Automation Task Registry Integration",
    labels: ["smart-contracts", "soroban", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Design an on-chain registry allowing community keepers to register and discover vaults with open automation reward bounties.

### Scope
- Store keeper stake requirements to prevent spam.
- Emit discovery events when bounties are deposited.`
  },
  {
    title: "[Keeper/Automation] Keeper Slashing Mechanism for Withheld Proofs-of-Life",
    labels: ["security", "soroban", "smart-contracts", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Incentivize honest keeper behavior by penalizing or unregistering keepers that fail to execute scheduled relays within the designated SLA window.

### Scope
- Implement dispute submission logic in Soroban contract.
- Reclaim keeper bond in the event of proven downtime.`
  },
  {
    title: "[Keeper/Automation] Telegram & Discord Webhook Alerts for Upcoming Expiration",
    labels: ["frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow vault creators to configure custom webhook URLs (Discord / Telegram) to receive automated ping notifications before their vault locks expire.

### Scope
- Add webhook configuration settings in User Profile.
- Send test ping to verify endpoint delivery.`
  },
  {
    title: "[Keeper/Automation] Multi-Signature Keeper Delegation with Expiring Authorizations",
    labels: ["security", "stellar", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Support temporary keeper delegation where an automation bot is authorized to relay heartbeats only for a specified duration (e.g. 90 days vacation mode).

### Scope
- Add \`keeper_auth_expiry\` timestamp in contract storage.
- Reject relay transactions submitted after the delegation window.`
  },
  {
    title: "[Keeper/Automation] Automated Worker for Soroban Ledger Rent Auto-Bumping",
    labels: ["stellar", "architecture", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Build a background cron job that monitors contract instance and entry TTLs and automatically invokes \`extend_ttl\` before rent runs out.

### Scope
- Automate rent management using keeper escrow reserves.
- Log rent bump receipts on-chain.`
  },
  {
    title: "[Keeper/Automation] Batch Execution Engine for Multi-Vault Heartbeat Relays",
    labels: ["performance", "stellar", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Optimize keeper operating costs by batching multiple vault heartbeats into a single multi-operation Stellar transaction.

### Scope
- Combine up to 20 \`prove_life_by_keeper\` calls in one transaction envelope.
- Save on transaction submission overhead.`
  },
  {
    title: "[Keeper/Automation] Health Monitoring Dashboard for Registered Community Keepers",
    labels: ["frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Provide a public status page displaying the health, active uptime, and successful relay count of all participating network keepers.

### Scope
- Fetch keeper stats from Stellar ledger history.
- Render uptime score and total verified pings.`
  },
  {
    title: "[Keeper/Automation] Economic Incentive & Tip Jar Escrow Mechanism",
    labels: ["smart-contracts", "soroban", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow creators to attach an optional micro-tip in XLM awarded to whichever keeper successfully triggers their emergency unlock after expiration.

### Scope
- Escrow tip funds in contract instance.
- Transfer reward automatically upon legitimate emergency execution.`
  },
  {
    title: "[Keeper/Automation] WebSocket Subscription Client for Real-Time Heartbeat Feeds",
    labels: ["architecture", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement WebSocket listener connecting to Stellar RPC ingestion engines to display live heartbeat pulses as they hit the ledger.

### Scope
- Replace polling with push-based WebSocket event subscription.
- Reduce RPC request volume by 70%.`
  },

  // ==========================================
  // 8. MOBILE & PWA CAPABILITIES (71-80)
  // ==========================================
  {
    title: "[Mobile/PWA] Progressive Web App Manifest & Offline Service Worker",
    labels: ["pwa", "frontend", "resilience", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Configure a full PWA manifest with asset precaching, standalone display mode, and custom icons for seamless installation on iOS and Android home screens.

### Scope
- Add \`manifest.webmanifest\` with maskable icons.
- Configure Workbox Service Worker for offline asset caching.`
  },
  {
    title: "[Mobile/PWA] Biometric FaceID & Fingerprint Fast-Unlock via WebAuthn",
    labels: ["pwa", "security", "crypto", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow mobile users to unlock their local decrypted vault session using native FaceID or Fingerprint authentication.

### Scope
- Prompt biometric verification before revealing sensitive documents.
- Fallback gracefully to session passcode.`
  },
  {
    title: "[Mobile/PWA] Web Share Target API for Direct Document Ingestion",
    labels: ["pwa", "frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Allow users on mobile devices to share files directly from their Files or Photos app into SpooVault using the Web Share Target API.

### Scope
- Register share target in PWA manifest.
- Receive shared files and route directly to \`AddDocumentModal\`.`
  },
  {
    title: "[Mobile/PWA] Adaptive Mobile Bottom Tab Navigation for Small Screens",
    labels: ["frontend", "ux", "pwa", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Provide a native-feeling mobile bottom navigation bar on viewports < 768px with quick access to Dashboard, Vaults, Documents, and Profile.

### Scope
- Hide sidebar rail on small screens and render sticky bottom navigation.
- Add active tab haptic indicator.`
  },
  {
    title: "[Mobile/PWA] Haptic Feedback Integration for Mobile Signing Actions",
    labels: ["frontend", "ux", "pwa", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Use the Web Vibration API (\`navigator.vibrate\`) to provide subtle tactile feedback upon successful transaction signing or passcode entry.

### Scope
- Trigger light vibration pattern on transaction confirmation.
- Include toggle in user profile settings to disable vibrations.`
  },
  {
    title: "[Mobile/PWA] Background Sync API for Queued Transactions",
    labels: ["pwa", "stellar", "resilience", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Queue offline actions (e.g. prepared heartbeat pings) and automatically submit them to Stellar when internet connectivity resumes.

### Scope
- Use Service Worker \`sync\` event listener.
- Notify user upon successful background synchronization.`
  },
  {
    title: "[Mobile/PWA] Camera QR Code Scanner for Swift Guardian Address Onboarding",
    labels: ["frontend", "ux", "pwa", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Integrate browser camera QR scanner using BarcodeDetector API to scan guardian Stellar public keys without manual copy-pasting.

### Scope
- Add camera permission request and live video viewport.
- Validate parsed text as a valid Stellar public key (\`G...\`).`
  },
  {
    title: "[Mobile/PWA] Dynamic Viewport Safe-Area Inset Handling for iOS Dynamic Island",
    labels: ["frontend", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Ensure headers, modals, and sticky action buttons properly respect iOS \`env(safe-area-inset-top)\` and \`env(safe-area-inset-bottom)\`.

### Scope
- Audit layout padding across iPhone 14/15 Pro viewports.
- Prevent content clipping beneath notch or home indicator bar.`
  },
  {
    title: "[Mobile/PWA] Origin Private File System (OPFS) Encrypted Document Stash",
    labels: ["storage", "security", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Use the high-performance Origin Private File System for fast, encrypted local document staging and PDF manipulation on mobile browsers.

### Scope
- Store temporary working files in OPFS sandbox.
- Clean up working buffers after encryption and upload.`
  },
  {
    title: "[Mobile/PWA] Low-Power Mode Detection & Graceful Animation Downgrades",
    labels: ["frontend", "performance", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Detect device battery status or \`prefers-reduced-motion\` to automatically tone down 3D visuals and background blur filters to save battery.

### Scope
- Query \`navigator.getBattery()\` and media queries.
- Disable particle animations when battery is under 20%.`
  },

  // ==========================================
  // 9. DEVOPS, TESTING & AUTOMATION (81-90)
  // ==========================================
  {
    title: "[Testing/CI] Automated GitHub Actions Matrix for Rust Soroban Protocol 22",
    labels: ["ci", "testing", "soroban", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Set up automated CI workflow compiling \`contracts-stellar\` with Rust 1.81.0, executing \`cargo test\`, and running WASM optimization checks on PRs.

### Scope
- Cache Cargo build artifacts and \`wasm32-unknown-unknown\` target.
- Enforce clean 0-warning compilation on all pull requests.`
  },
  {
    title: "[Testing/CI] Vitest Code Coverage Badge & Regression Thresholds",
    labels: ["testing", "ci", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Generate automated code coverage reports with c8/v8 in Vitest and enforce a minimum 85% branch coverage policy.

### Scope
- Configure \`vitest --coverage\` in CI pipeline.
- Publish interactive HTML coverage summary as workflow artifact.`
  },
  {
    title: "[Testing/CI] End-to-End Headless Browser Testing with Playwright & Mock Freighter",
    labels: ["testing", "ci", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Add Playwright E2E tests validating the complete user journey: wallet connection, vault creation, file upload, and simulated unlock.

### Scope
- Inject mock \`window.freighter\` provider in test environment.
- Run tests headless across Chromium, Firefox, and WebKit.`
  },
  {
    title: "[DevOps] Multi-Stage Production Docker Containerization with Nginx Alpine",
    labels: ["ci", "architecture", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Provide a hardened, lightweight multi-stage Dockerfile that builds the Vite frontend and serves static assets via optimized Nginx Alpine.

### Scope
- Configure gzip / brotli compression headers.
- Set security headers: CSP, HSTS, X-Content-Type-Options.`
  },
  {
    title: "[Testing/CI] Automated WASM Bytecode Disassembly & Gas Cost Diff in PRs",
    labels: ["ci", "soroban", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Add a GitHub Actions bot that comments the exact WASM size diff and estimated CPU/Memory fee changes whenever contract code is modified.

### Scope
- Run \`scripts/optimize-wasm.mjs\` in CI.
- Compare byte size against main branch baseline.`
  },
  {
    title: "[Testing/CI] Mutation Testing Suite for Soroban Smart Contract Paths",
    labels: ["testing", "security", "soroban", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Integrate \`cargo-mutants\` to discover untested edge cases and verify that contract test suites catch intentional code regressions.

### Scope
- Run mutation testing on auth checks and timeout logic.
- Document any mutant survivors and add targeted test assertions.`
  },
  {
    title: "[Testing/CI] Automated Dependency Vulnerability Auditing with Snyk & Cargo Audit",
    labels: ["ci", "security", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Schedule weekly automated vulnerability scans across npm and Cargo dependency trees to catch known CVEs proactively.

### Scope
- Add \`cargo audit\` and \`npm audit --production\` CI step.
- Alert maintainers immediately if high-severity CVEs are discovered.`
  },
  {
    title: "[Testing/CI] Nightly Stellar Testnet Integration Test Cron Job",
    labels: ["testing", "ci", "stellar", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Execute a daily integration smoke test against the live Stellar Testnet contract to verify RPC stability and network compatibility.

### Scope
- Run \`scripts/smoke-check.mjs\` on a daily schedule.
- Post status report to GitHub Actions summary.`
  },
  {
    title: "[Testing/CI] Differential Fuzz Testing for Shamir Secret Sharing Polynomials",
    labels: ["testing", "crypto", "security", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Implement property-based fuzz tests using fast-check to verify that SSS share reconstruction holds true across 10,000 randomized (k, n) combinations.

### Scope
- Test threshold boundaries: k-1 shares must yield zero information.
- Verify exact secret recovery with any subset of k shares.`
  },
  {
    title: "[Testing/CI] Automated Lighthouse CI Performance & Accessibility Gates",
    labels: ["ci", "frontend", "performance", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Enforce Lighthouse performance, accessibility, best practices, and SEO scores >= 95 in CI before pull requests can be merged.

### Scope
- Configure \`@lhci/cli\` in pull request checks.
- Prevent regression of First Contentful Paint and Cumulative Layout Shift.`
  },

  // ==========================================
  // 10. DOCUMENTATION & ECOSYSTEM (91-100)
  // ==========================================
  {
    title: "[Docs/Ecosystem] Interactive Soroban RPC Playground in Documentation Hub",
    labels: ["documentation", "frontend", "soroban", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Embed an interactive RPC console on \`/docs\` allowing developers to test contract queries (\`get_vault\`, \`get_proof_of_life\`) directly from the browser.

### Scope
- Build in-browser Soroban query runner in \`DocsPage.tsx\`.
- Provide pre-populated sample inputs for instant testing.`
  },
  {
    title: "[Docs/Ecosystem] Step-by-Step Interactive Walkthrough for Vault Creators",
    labels: ["documentation", "ux", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Add an interactive guided tour using Shepherd.js or Driver.js highlighting key UI elements during a user's first vault creation.

### Scope
- Provide tooltips explaining Heartbeat Timeout and Guardian Quorum concepts.
- Allow users to dismiss or replay the walkthrough at any time.`
  },
  {
    title: "[Docs/Ecosystem] Multi-Language Documentation Localization (i18n)",
    labels: ["documentation", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Translate key documentation sections, README, and protocol architecture summaries into Spanish, Mandarin, and French.

### Scope
- Set up markdown translation directory structure in \`docs/i18n/\`.
- Encourage global community contributions for language reviews.`
  },
  {
    title: "[Docs/Ecosystem] GrantFox Contributor Onboarding Guide with Starter Tasks",
    labels: ["documentation", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Create a dedicated \`CONTRIBUTING_GUIDE.md\` detailing local dev setup, test execution, branching rules, and how to claim GrantFox rewardable issues.

### Scope
- Provide copy-paste setup commands for Windows, macOS, and Linux.
- Detail the PR review and reward distribution process.`
  },
  {
    title: "[Docs/Ecosystem] Formal Threat Model & Cryptographic Assumptions Paper",
    labels: ["documentation", "security", "crypto", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Publish a formal security analysis document outlining adversary capabilities, trust assumptions, keeper collusion vectors, and mitigations.

### Scope
- Document ECIES, SSS, and Stellar protocol trust boundaries.
- Publish in \`docs/SECURITY_THREAT_MODEL.md\`.`
  },
  {
    title: "[Docs/Ecosystem] Stellar Community Fund (SCF) Milestone Progress Tracker",
    labels: ["documentation", "stellar", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Maintain a dedicated public roadmap page tracking delivery milestones for Drips Wave, GrantFox, and Stellar Community Fund grants.

### Scope
- List completed deliverables, active sprints, and upcoming features.
- Link each milestone directly to closed GitHub PRs and commits.`
  },
  {
    title: "[Docs/Ecosystem] Interactive Shamir's Secret Sharing Visualizer",
    labels: ["documentation", "crypto", "frontend", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Build an educational interactive visualizer showing how polynomial curves split a secret into 2D coordinates and reconstruct it via Lagrange interpolation.

### Scope
- Render dynamic 2D Cartesian plane using HTML Canvas / SVG.
- Allow users to drag points and see the polynomial curve adapt in real time.`
  },
  {
    title: "[Docs/Ecosystem] Automated TypeDoc & SDK Reference Generation",
    labels: ["documentation", "ci", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Generate and host comprehensive TypeScript API reference documentation for the SpooVault client SDK using TypeDoc.

### Scope
- Configure TypeDoc for \`src/services/\` and \`src/utils/\`.
- Publish generated docs to GitHub Pages or \`/docs/api\`.`
  },
  {
    title: "[Docs/Ecosystem] Security Audit Checklist & Responsible Bug Bounty Guidelines",
    labels: ["documentation", "security", "good first issue", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Publish formal bug bounty terms with reward tiers (Critical, High, Medium, Low) and safe harbor guidelines for ethical security researchers.

### Scope
- Detail vulnerability submission channels and PGP keys.
- Outline response SLAs and patch disclosure timelines.`
  },
  {
    title: "[Docs/Ecosystem] Developer CLI Starter Template: create-spoovault-app",
    labels: ["documentation", "architecture", "GrantFox OSS", "Fourth Campaign", "Maybe Rewarded"],
    body: `### Objective
Develop an npm initializer package (\`npm create spoovault-app\`) that bootstraps a custom dApp integrating SpooVault's on-chain custody protocol.

### Scope
- Provide ready-to-run template with Stellar SDK and Web3 context.
- Include sample vault deployment and retrieval scripts.`
  }
];

console.log(`Starting creation of ${issues.length} issues on ${repo}...`);

for (let i = 0; i < issues.length; i++) {
  const issue = issues[i];
  console.log(`[${i + 1}/${issues.length}] Creating: ${issue.title}`);

  const args = [
    "issue",
    "create",
    "--repo",
    repo,
    "--title",
    issue.title,
    "--body-file",
    "-",
  ];

  for (const label of issue.labels) {
    args.push("--label", label);
  }

  try {
    const res = spawnSync("gh", args, {
      input: issue.body,
      encoding: "utf8",
    });

    if (res.status === 0) {
      console.log(`   -> Created: ${res.stdout.trim()}`);
    } else {
      console.error(`   -> Failed (${res.status}): ${res.stderr.trim()}`);
    }
  } catch (err) {
    console.error(`   -> Error: ${err.message}`);
  }

  // Rate-limiting delay (1.2 seconds between issues)
  await delay(1200);
}

console.log("All 100 issues have been successfully processed!");
