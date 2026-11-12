# SpooVault Community & GrantFox Contributor Issues

This document indexes the **100 live community issues** on GitHub, published for open-source contributors, **GrantFox Fourth Campaign bounties**, and **Drips Wave / SCF milestone execution**.

All issues are published and trackable directly on GitHub:  
👉 **[View Active Issues on GitHub](https://github.com/spoo-vault/spoovault/issues)**

---

## 🏷️ Standardized Labels & Tiers

| Label | Description |
|---|---|
| `GrantFox OSS` | Official GrantFox open-source program tracked issue |
| `Fourth Campaign` | Eligible for Fourth Campaign milestone bounties |
| `Maybe Rewarded` | Flagged for contributor incentive disbursements |
| `good first issue` | Curated starter tasks for new ecosystem contributors |
| `soroban` | Soroban Rust Protocol 22 smart contract development |
| `stellar` | Stellar Horizon RPC, SDK, and wallet integrations |
| `crypto` | Zero-knowledge, ECIES, SSS, and key custody tasks |
| `frontend` | React 18, Tailwind CSS, HeroUI, and responsive UI |
| `storage` | IPFS, Pinata, and decentralized storage resilience |
| `pwa` | Progressive Web App, WebAuthn, and mobile features |
| `testing` / `ci` | Vitest, Playwright E2E, and GitHub Actions automation |

---

## 🧭 The 10 Core Architectural Domains (100 Issues)

### 1. ⚡ [Soroban Smart Contracts](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Asoroban) (Issues #284–#293)
- Batch Access Requests for Multiple Inherited Vaults ([#284](https://github.com/spoo-vault/spoovault/issues/284))
- Dynamic Storage Rent Calculation & TTL Warning Telemetry ([#285](https://github.com/spoo-vault/spoovault/issues/285))
- Upgradeable Contract Authorization via Multi-Sig Admin Quorum ([#286](https://github.com/spoo-vault/spoovault/issues/286))
- Asset-Gated Vault Access Tokens using Soroban CAP-46 Interface ([#287](https://github.com/spoo-vault/spoovault/issues/287))
- Cross-Contract Access Verification Hook for External DAOs ([#288](https://github.com/spoo-vault/spoovault/issues/288))
- Configurable Proof-of-Life Grace Period & Window Intervals ([#289](https://github.com/spoo-vault/spoovault/issues/289))
- Contract Event Emission Indexing with Bloom Filter Optimization ([#290](https://github.com/spoo-vault/spoovault/issues/290))
- Soroban Contract Custom Error Enum Exhaustiveness ([#291](https://github.com/spoo-vault/spoovault/issues/291))
- Transient Storage Compaction for Gas Cost Reduction ([#292](https://github.com/spoo-vault/spoovault/issues/292))
- On-Chain Curve25519 & Ed25519 Cryptographic Signature Verification ([#293](https://github.com/spoo-vault/spoovault/issues/293))

### 2. 🔐 [Crypto & Zero-Knowledge Security](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Acrypto) (Issues #294–#303)
- Zero-Knowledge Groth16 Proof of Beneficiary Identity ([#294](https://github.com/spoo-vault/spoovault/issues/294))
- Post-Quantum Hybrid Key Encapsulation (ML-KEM-768 + X25519) ([#295](https://github.com/spoo-vault/spoovault/issues/295))
- Timelock Secret Encryption using Verifiable Delay Functions (VDF) ([#296](https://github.com/spoo-vault/spoovault/issues/296))
- Proactive Secret Resharing (SSS) without Master Key Re-assembly ([#297](https://github.com/spoo-vault/spoovault/issues/297))
- OPAQUE PAKE Protocol Verification for Zero-Knowledge PIN Entry ([#298](https://github.com/spoo-vault/spoovault/issues/298))
- WebAuthn & Hardware Passkey Biometric Signature Isolation ([#299](https://github.com/spoo-vault/spoovault/issues/299))
- Argon2id Memory-Hardness Calibration Benchmark in Web Workers ([#300](https://github.com/spoo-vault/spoovault/issues/300))
- Constant-Time Cryptographic Comparison for Key Shares ([#301](https://github.com/spoo-vault/spoovault/issues/301))
- Automated Ephemeral Memory Zeroization for Decrypted Buffers ([#302](https://github.com/spoo-vault/spoovault/issues/302))
- Cryptographic Merkle Proofs for Multi-Document Vault Manifests ([#303](https://github.com/spoo-vault/spoovault/issues/303))

### 3. 📦 [Storage & IPFS Resilience](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Astorage) (Issues #304–#313, #375)
- Multi-Gateway Circuit Breaker with Dynamic Latency Scorer ([#304](https://github.com/spoo-vault/spoovault/issues/304))
- Web Streams Chunked Encryption for 100MB+ Large Files ([#305](https://github.com/spoo-vault/spoovault/issues/305))
- Arweave & Filecoin Dual Decentralized Archival Backup ([#306](https://github.com/spoo-vault/spoovault/issues/306))
- Dynamic Client-Side Document Watermarking for Decrypted Proofs ([#307](https://github.com/spoo-vault/spoovault/issues/307))
- Content Addressable CAR Packaging & IPLD Traversal ([#308](https://github.com/spoo-vault/spoovault/issues/308))
- Storage Quota Calculator & Cost Forecasting per Vault ([#309](https://github.com/spoo-vault/spoovault/issues/309))
- Content Hash Deduplication across Vault Revisions ([#310](https://github.com/spoo-vault/spoovault/issues/310))
- Offline Vault Cache via IndexedDB & OPFS Sandbox ([#375](https://github.com/spoo-vault/spoovault/issues/375))
- In-Browser Streaming Audio & Video Decryption ([#312](https://github.com/spoo-vault/spoovault/issues/312))
- Pinned Status Health Verifier and Pinata SLA Monitor ([#313](https://github.com/spoo-vault/spoovault/issues/313))

### 4. 🌐 [Stellar & Web3 Integration](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Astellar) (Issues #376–#385)
- Horizon & Soroban RPC Automatic Fallback Provider Pooling ([#376](https://github.com/spoo-vault/spoovault/issues/376))
- Freighter Wallet Account & Network Switch Event Listener ([#377](https://github.com/spoo-vault/spoovault/issues/377))
- Albedo Mobile QR Code Bridge for In-Person Key Ceremonies ([#378](https://github.com/spoo-vault/spoovault/issues/378))
- xBull Wallet Fee Delegation & Multi-Account Selector UI ([#379](https://github.com/spoo-vault/spoovault/issues/379))
- Stellar Asset Contract (SAC) Native XLM Escrow Tracking ([#380](https://github.com/spoo-vault/spoovault/issues/380))
- Dynamic Fee Estimation Buffer for Congested Ledgers ([#381](https://github.com/spoo-vault/spoovault/issues/381))
- Automatic Session Disconnect on Account Invalidation ([#382](https://github.com/spoo-vault/spoovault/issues/382))
- Direct Mobile Deep-Link Schemes for Stellar Wallets ([#383](https://github.com/spoo-vault/spoovault/issues/383))
- Stellar Claimable Balance Integration for Inheritance Funds ([#384](https://github.com/spoo-vault/spoovault/issues/384))
- Testnet Friendbot Faucet Rate Limiter & Fallback Service ([#385](https://github.com/spoo-vault/spoovault/issues/385))

### 5. 🎨 [Frontend & UI/UX Excellence](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Afrontend) (Issues #314–#320, #386, #387)
- Live Stellar Ledger TPS & Network Health Ticker in Header ([#386](https://github.com/spoo-vault/spoovault/issues/386))
- Ambient Interactive 3D Cryptographic Vault Hologram ([#315](https://github.com/spoo-vault/spoovault/issues/315))
- Complete ARIA Accessibility & Keyboard Navigation Suite ([#316](https://github.com/spoo-vault/spoovault/issues/316))
- High-Contrast Dark & Cyber-Purple Theme System Sync ([#317](https://github.com/spoo-vault/spoovault/issues/317))
- Multi-Step Vault Creation Wizard with Auto-Draft Persistence ([#318](https://github.com/spoo-vault/spoovault/issues/318))
- Mobile Slide Drawer Navigation & Swipe Gestures ([#387](https://github.com/spoo-vault/spoovault/issues/387))
- Real-Time Debounced Fuzzy Search across Vault Documents ([#319](https://github.com/spoo-vault/spoovault/issues/319))
- Centralized Toast Notification Manager & Activity Drawer ([#320](https://github.com/spoo-vault/spoovault/issues/320))

### 6. 📊 [Analytics & Dashboard](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Aux) (Issues #321–#328, #356, #357)
- Visual Dead Man Countdown Radial Rings ([#321](https://github.com/spoo-vault/spoovault/issues/321))
- Real-Time Guardian Quorum Matrix Visualization ([#322](https://github.com/spoo-vault/spoovault/issues/322))
- Export Tamper-Proof Audit Trail to Signed PDF Bundle ([#323](https://github.com/spoo-vault/spoovault/issues/323))
- Storage Usage Breakdown by File Format & Encryption ([#324](https://github.com/spoo-vault/spoovault/issues/324))
- Network Fee Historical Comparison vs Traditional EVM ([#356](https://github.com/spoo-vault/spoovault/issues/356))
- Beneficiary Access Attempt Log with IP Anonymization ([#325](https://github.com/spoo-vault/spoovault/issues/325))
- Web Push API Browser Inactivity Warning Notifications ([#357](https://github.com/spoo-vault/spoovault/issues/357))
- Interactive Guardian Network Graph using D3 Force Layout ([#326](https://github.com/spoo-vault/spoovault/issues/326))
- CSV & Excel Export for Enterprise Vault Compliance ([#327](https://github.com/spoo-vault/spoovault/issues/327))
- Micro-Chart Sparklines for Heartbeat Consistency ([#328](https://github.com/spoo-vault/spoovault/issues/328))

### 7. 🤖 [Keeper & Automation Infrastructure](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Aarchitecture) (Issues #329–#334, #358–#361)
- Decentralized Off-Chain Relayer for Automated Heartbeats ([#358](https://github.com/spoo-vault/spoovault/issues/358))
- Stellar Automation Task Registry Integration ([#329](https://github.com/spoo-vault/spoovault/issues/329))
- Keeper Slashing Mechanism for Withheld Proofs-of-Life ([#330](https://github.com/spoo-vault/spoovault/issues/330))
- Telegram & Discord Webhook Alerts for Upcoming Expiration ([#331](https://github.com/spoo-vault/spoovault/issues/331))
- Multi-Signature Keeper Delegation with Expiring Authorizations ([#359](https://github.com/spoo-vault/spoovault/issues/359))
- Automated Worker for Soroban Ledger Rent Auto-Bumping ([#360](https://github.com/spoo-vault/spoovault/issues/360))
- Batch Execution Engine for Multi-Vault Heartbeat Relays ([#361](https://github.com/spoo-vault/spoovault/issues/361))
- Health Monitoring Dashboard for Registered Community Keepers ([#332](https://github.com/spoo-vault/spoovault/issues/332))
- Economic Incentive & Tip Jar Escrow Mechanism ([#333](https://github.com/spoo-vault/spoovault/issues/333))
- WebSocket Subscription Client for Real-Time Heartbeat Feeds ([#334](https://github.com/spoo-vault/spoovault/issues/334))

### 8. 📱 [Mobile & PWA Capabilities](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Apwa) (Issues #335–#337, #362–#368)
- Progressive Web App Manifest & Offline Service Worker ([#362](https://github.com/spoo-vault/spoovault/issues/362))
- Biometric FaceID & Fingerprint Fast-Unlock via WebAuthn ([#363](https://github.com/spoo-vault/spoovault/issues/363))
- Web Share Target API for Direct Document Ingestion ([#364](https://github.com/spoo-vault/spoovault/issues/364))
- Adaptive Mobile Bottom Tab Navigation for Small Screens ([#365](https://github.com/spoo-vault/spoovault/issues/365))
- Haptic Feedback Integration for Mobile Signing Actions ([#366](https://github.com/spoo-vault/spoovault/issues/366))
- Background Sync API for Queued Transactions ([#367](https://github.com/spoo-vault/spoovault/issues/367))
- Camera QR Code Scanner for Swift Guardian Address Onboarding ([#368](https://github.com/spoo-vault/spoovault/issues/368))
- Dynamic Viewport Safe-Area Inset Handling for iOS Dynamic Island ([#335](https://github.com/spoo-vault/spoovault/issues/335))
- Origin Private File System (OPFS) Encrypted Document Stash ([#336](https://github.com/spoo-vault/spoovault/issues/336))
- Low-Power Mode Detection & Graceful Animation Downgrades ([#337](https://github.com/spoo-vault/spoovault/issues/337))

### 9. 🛠️ [Testing, CI & DevOps](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Atesting) (Issues #338–#346, #369)
- Automated GitHub Actions Matrix for Rust Soroban Protocol 22 ([#338](https://github.com/spoo-vault/spoovault/issues/338))
- Vitest Code Coverage Badge & Regression Thresholds ([#339](https://github.com/spoo-vault/spoovault/issues/339))
- End-to-End Headless Browser Testing with Playwright & Mock Freighter ([#340](https://github.com/spoo-vault/spoovault/issues/340))
- Multi-Stage Production Docker Containerization with Nginx Alpine ([#341](https://github.com/spoo-vault/spoovault/issues/341))
- Automated WASM Bytecode Disassembly & Gas Cost Diff in PRs ([#342](https://github.com/spoo-vault/spoovault/issues/342))
- Mutation Testing Suite for Soroban Smart Contract Paths ([#343](https://github.com/spoo-vault/spoovault/issues/343))
- Automated Dependency Vulnerability Auditing with Snyk & Cargo Audit ([#344](https://github.com/spoo-vault/spoovault/issues/344))
- Nightly Stellar Testnet Integration Test Cron Job ([#369](https://github.com/spoo-vault/spoovault/issues/369))
- Differential Fuzz Testing for Shamir Secret Sharing Polynomials ([#345](https://github.com/spoo-vault/spoovault/issues/345))
- Automated Lighthouse CI Performance & Accessibility Gates ([#346](https://github.com/spoo-vault/spoovault/issues/346))

### 10. 📚 [Documentation & Ecosystem](https://github.com/spoo-vault/spoovault/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation) (Issues #347–#355, #370)
- Interactive Soroban RPC Playground in Documentation Hub ([#347](https://github.com/spoo-vault/spoovault/issues/347))
- Step-by-Step Interactive Walkthrough for Vault Creators ([#348](https://github.com/spoo-vault/spoovault/issues/348))
- Multi-Language Documentation Localization (i18n) ([#349](https://github.com/spoo-vault/spoovault/issues/349))
- GrantFox Contributor Onboarding Guide with Starter Tasks ([#350](https://github.com/spoo-vault/spoovault/issues/350))
- Formal Threat Model & Cryptographic Assumptions Paper ([#351](https://github.com/spoo-vault/spoovault/issues/351))
- Stellar Community Fund (SCF) Milestone Progress Tracker ([#370](https://github.com/spoo-vault/spoovault/issues/370))
- Interactive Shamir's Secret Sharing Visualizer ([#352](https://github.com/spoo-vault/spoovault/issues/352))
- Automated TypeDoc & SDK Reference Generation ([#353](https://github.com/spoo-vault/spoovault/issues/353))
- Security Audit Checklist & Responsible Bug Bounty Guidelines ([#354](https://github.com/spoo-vault/spoovault/issues/354))
- Developer CLI Starter Template: `create-spoovault-app` ([#355](https://github.com/spoo-vault/spoovault/issues/355))

---

## 🚀 How to Claim an Issue
1. Review the scope and acceptance criteria in the issue description.
2. Comment on the issue: `I would like to work on this!`.
3. Create a branch: `git checkout -b feat/issue-<number>-<short-description>`.
4. Submit your PR targeting the `dev` branch referencing the issue (`Closes #<number>`).
