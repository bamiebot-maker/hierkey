import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiBook,
  FiCode,
  FiTerminal,
  FiShield,
  FiCheckCircle,
  FiExternalLink,
  FiCpu,
  FiCopy,
  FiSearch,
  FiKey,
  FiLock,
  FiActivity,
  FiUsers,
  FiArrowRight,
  FiMenu,
  FiX,
  FiAward,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import BrandLogo from "../components/BrandLogo";

const NEAR_CONTRACT_ID = "hierkey-363594.testnet";
const NEAR_TESTNET_EXPLORER = `https://testnet.nearblocks.io/address/${NEAR_CONTRACT_ID}`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const navGroups = [
    {
      title: "Getting Started",
      items: [
        { id: "overview", label: "Protocol Overview", icon: FiBook },
        { id: "problem", label: "The Dead Man's Switch", icon: FiActivity },
        { id: "architecture", label: "System Architecture", icon: FiCpu },
      ],
    },
    {
      title: "Cryptography & Security",
      items: [
        { id: "cryptography", label: "ECIES & SSS Encryption", icon: FiLock },
        { id: "passkeys", label: "WebAuthn & Passkeys", icon: FiKey },
        { id: "security", label: "Security & Threat Model", icon: FiShield },
      ],
    },
    {
      title: "NEAR Smart Contracts",
      items: [
        { id: "contract-overview", label: "Contract Reference", icon: FiCode },
        { id: "methods", label: "Core Methods & API", icon: FiTerminal },
        { id: "storage-staking", label: "Storage Staking & Access Keys", icon: FiShield },
      ],
    },
    {
      title: "Development & Testing",
      items: [
        { id: "testing", label: "Test Suites (Rust near-sdk / Vitest)", icon: FiCheckCircle },
        { id: "deployment", label: "Deployment & Verification", icon: FiTerminal },
      ],
    },
    {
      title: "Ecosystem & Governance",
      items: [
        { id: "grants", label: "NEAR Ecosystem & Hackathon", icon: FiAward },
        { id: "maintainers", label: "Maintainers & Community", icon: FiUsers },
      ],
    },
  ];

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return navGroups;
    const q = searchQuery.toLowerCase();
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.id.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#070A0E] text-slate-200 font-sans selection:bg-[#00EC97]/30 selection:text-white">
      {/* Top Docs Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0F17]/90 border-b border-white/[0.08] px-4 lg:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <BrandLogo className="w-8 h-8" />
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-[#00EC97] transition-colors">
                  Hierkey <span className="text-[#00EC97] font-mono text-sm font-normal">Docs</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  NEAR Protocol Native
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[#00EC97]/10 text-[#00EC97] border border-[#00EC97]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
              NEAR Testnet Live
            </span>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, methods, cryptographic specs..."
                className="w-full bg-[#111722]/90 border border-white/[0.08] rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00EC97]/60 focus:ring-1 focus:ring-[#00EC97]/40 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <a
              href="https://github.com/hierkey/hierkey"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
            >
              <FiCode className="text-sm" />
              <span>GitHub</span>
              <FiExternalLink className="text-[10px] text-slate-500" />
            </a>

            <a
              href={NEAR_TESTNET_EXPLORER}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-[#00EC97] bg-[#00EC97]/10 hover:bg-[#00EC97]/20 border border-[#00EC97]/30 transition-all"
            >
              <span>Contract Explorer</span>
              <FiExternalLink className="text-[10px]" />
            </a>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-gray-950 bg-[#00EC97] hover:bg-[#00d688] shadow-md shadow-[#00EC97]/20 transition-all"
            >
              <span>Launch App</span>
              <FiArrowRight className="text-xs" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex gap-8">
        {/* Left Sticky Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0B0F17] border-r border-white/[0.08] p-6 overflow-y-auto transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:shrink-0 md:bg-transparent md:border-r-0 md:p-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Mobile Search */}
          <div className="sm:hidden mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search docs..."
                className="w-full bg-[#111722] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 px-2">
                  {group.title}
                </div>
                <nav className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                          document
                            .getElementById(item.id)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left ${
                          isActive
                            ? "bg-[#00EC97]/15 text-[#00EC97] border border-[#00EC97]/30 font-semibold shadow-sm"
                            : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                        }`}
                      >
                        <Icon className={`text-sm ${isActive ? "text-[#00EC97]" : "text-slate-500"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Contract ID Quick Card */}
          <div className="mt-8 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2">
            <div className="text-[10px] font-mono text-[#00EC97] font-semibold uppercase">
              Live Testnet Contract
            </div>
            <div className="font-mono text-[10px] text-slate-300 break-all select-all bg-[#070A0E] p-1.5 rounded border border-white/[0.08]">
              {NEAR_CONTRACT_ID}
            </div>
            <button
              onClick={() => copyToClipboard(NEAR_CONTRACT_ID, "Contract ID")}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded transition-all"
            >
              <FiCopy className="text-xs" />
              <span>Copy Contract ID</span>
            </button>
          </div>
        </aside>

        {/* Right Documentation Content */}
        <main className="flex-1 min-w-0 space-y-16 pb-20">
          {/* Section: Overview */}
          <section id="overview" className="space-y-6 scroll-mt-24">
            <div className="p-6 md:p-8 rounded-2xl bg-[#0E141E] border border-white/[0.08] shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#00EC97]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-[#00EC97]/10 text-[#00EC97] border border-[#00EC97]/30">
                  <FiBook className="text-xs" /> Protocol Architecture
                </span>
                <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                  Hierkey Documentation &amp; Engineering Specifications
                </h1>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
                  Hierkey is an autonomous, decentralized key and document custody protocol natively engineered on{" "}
                  <strong className="text-[#00EC97]">NEAR Protocol (Rust / near-sdk-rs)</strong>. It provides trustless Dead Man&apos;s Switch mechanisms, Function-Call Access Key automation, Shamir&apos;s Secret Sharing (SSS) Guardian consensus, ECIES client-side payload encryption, and passkey authentication for sovereign digital legacy preservation.
                </p>

                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-[#080B10] border border-white/[0.08]">
                    <div className="text-xs font-mono text-slate-400">Chain Native</div>
                    <div className="text-sm font-semibold text-white mt-1">NEAR Protocol (Rust)</div>
                    <div className="text-[11px] text-[#00EC97] mt-0.5">near-sdk-rs contract</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080B10] border border-white/[0.08]">
                    <div className="text-xs font-mono text-slate-400">Autonomous Switch</div>
                    <div className="text-sm font-semibold text-white mt-1">Proof-of-Life Heartbeats</div>
                    <div className="text-[11px] text-[#00EC97] mt-0.5">Function-Call Access Key Relays</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#080B10] border border-white/[0.08]">
                    <div className="text-xs font-mono text-slate-400">Cryptographic Privacy</div>
                    <div className="text-sm font-semibold text-white mt-1">Client-Side ECIES + SSS</div>
                    <div className="text-[11px] text-[#00EC97] mt-0.5">k-of-n Guardian recovery</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Problem & Solution */}
          <section id="problem" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiActivity className="text-[#00EC97]" />
              The Dead Man&apos;s Switch Problem &amp; NEAR Advantage
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Billions of dollars in digital assets, legal credentials, private keys, and critical company documents are permanently lost every year due to sudden incapacitation or demise of single keyholders. Centralized custody solutions reintroduce counterparty failure, custodial seizure, and single-point-of-compromise vulnerabilities.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-red-950/15 border border-red-900/30 space-y-2">
                <div className="text-xs font-bold font-mono text-red-400 uppercase">
                  Traditional / Centralized Custody Flaws
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Custodians hold unencrypted plaintext or server-side keys.</li>
                  <li>Subject to arbitrary account freeze, KYC lockouts, or insolvency.</li>
                  <li>Inflexible inheritance requiring prolonged probate court orders.</li>
                  <li>Expensive recurring maintenance fees regardless of usage.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#00EC97]/10 border border-[#00EC97]/30 space-y-2">
                <div className="text-xs font-bold font-mono text-[#00EC97] uppercase">
                  Hierkey on NEAR Protocol
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Pure smart contract custody executed transparently on NEAR Testnet.</li>
                  <li>Sub-second block processing and fractional-cent gas costs.</li>
                  <li>NEAR Function-Call Access Keys permit automated keepers to heartbeat without accessing funds or secrets.</li>
                  <li>Shamir&apos;s Secret Sharing distributes key shards across independent Guardians.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Architecture */}
          <section id="architecture" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiCpu className="text-[#00EC97]" />
              System Architecture &amp; Lifecycle
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hierkey combines on-chain state coordination via NEAR Protocol with off-chain cryptographic storage powered by IPFS and WebAuthn authenticators:
            </p>

            <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] font-mono text-xs text-[#00EC97] space-y-2 overflow-x-auto">
              <div className="text-slate-400">// High-level lifecycle flow:</div>
              <div>[1. Creator] ==(ECIES Encrypt Document)==&gt; [IPFS CID]</div>
              <div>[2. Creator] ==(create_vault(heartbeat_interval, guardians, beneficiaries))==&gt; [NEAR Contract: hierkey.testnet]</div>
              <div>[3. Periodic] ==(prove_life() or Function-Call Access Key keeper relay)==&gt; [Resets Heartbeat Timer]</div>
              <div>[4. Expiration] ==(Block Timestamp &gt; LastHeartbeat + Interval)==&gt; [Status: UNLOCKED / EMERGENCY]</div>
              <div>[5. Beneficiary] ==(claim_vault() + Guardian SSS Shard Aggregation)==&gt; [Decrypted Assets]</div>
            </div>
          </section>

          {/* Section: Cryptography */}
          <section id="cryptography" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiLock className="text-[#00EC97]" />
              Cryptographic Specification: ECIES &amp; SSS
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hierkey enforces zero-knowledge architecture. Neither NEAR validators, the contract deployer, nor IPFS gateways ever have access to unencrypted file content or private keys.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="text-sm font-bold text-white">1. Client-Side ECIES Payload Encryption</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Documents are encrypted in the user&apos;s browser using AES-256-GCM with a freshly generated ephemeral 256-bit symmetric key. The symmetric key is then encrypted via Elliptic Curve Integrated Encryption Scheme (ECIES) using the creator&apos;s public key and the designated beneficiaries&apos; public keys.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="text-sm font-bold text-white">2. Shamir&apos;s Secret Sharing (SSS) Guardian Consensus</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For high-value vaults, the master decryption key is split into <code className="text-[#00EC97] font-mono">n</code> polynomial shards with a threshold requirement of <code className="text-[#00EC97] font-mono">k</code> shards (<code className="text-[#00EC97] font-mono">k &lt;= n</code>). Each Guardian receives an individually encrypted shard. When emergency mode triggers, a quorum of <code className="text-[#00EC97] font-mono">k</code> guardians must approve before the reconstruction key is assembled.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Passkeys */}
          <section id="passkeys" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiKey className="text-[#00EC97]" />
              WebAuthn &amp; Hardware Passkey Integration
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hierkey integrates native FIDO2 / WebAuthn hardware biometric signing (Apple TouchID, FaceID, Windows Hello, YubiKey). Passkeys eliminate seed-phrase loss vulnerability for non-technical users while providing hardware-isolated cryptographic keypairs.
            </p>
            <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">Session Lock Gate &amp; Privacy Guard</div>
              <p>
                The frontend implements automatic inactivity session locking (<code className="text-[#00EC97] font-mono">15m idle</code>). When triggered, volatile cryptographic keys in memory are scrubbed, requiring biometric or wallet authentication to restore the session.
              </p>
            </div>
          </section>

          {/* Section: Contract Reference */}
          <section id="contract-overview" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiCode className="text-[#00EC97]" />
              NEAR Smart Contract Reference (near-sdk-rs)
            </h2>
            <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono text-[#00EC97] font-bold uppercase">
                  Active Deployment Contract ID
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00EC97]/10 text-[#00EC97] border border-[#00EC97]/30 font-mono">
                  Verified on NEAR Testnet
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#070A0E] p-2.5 rounded-lg border border-white/[0.08]">
                <code className="text-xs font-mono text-white break-all select-all flex-1">
                  {NEAR_CONTRACT_ID}
                </code>
                <button
                  onClick={() => copyToClipboard(NEAR_CONTRACT_ID, "Contract ID")}
                  className="px-2.5 py-1 text-xs font-mono font-medium text-slate-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded transition-all shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>
          </section>

          {/* Section: Methods */}
          <section id="methods" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiTerminal className="text-[#00EC97]" />
              Core Contract Methods
            </h2>
            <div className="space-y-4">
              {/* Method 1 */}
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-[#00EC97]">
                    create_vault(name, description, heartbeat_interval_sec, guardians, guardian_threshold, beneficiaries, authorized_keeper, metadata_cid) -&gt; U64
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.08]">
                    Change
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Initializes a new Dead Man&apos;s Switch vault on the NEAR state trie. Sets the initial heartbeat timestamp to current block timestamp and returns the newly assigned numeric Vault ID.
                </p>
              </div>

              {/* Method 2 */}
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-[#00EC97]">
                    prove_life(vault_id: U64)
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.08]">
                    Change
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Resets the heartbeat timer. Can be invoked directly by the vault owner or by an authorized Keeper utilizing a scoped Function-Call Access Key.
                </p>
              </div>

              {/* Method 3 */}
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-[#00EC97]">
                    approve_emergency_release(vault_id: U64)
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.08]">
                    Change
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Allows registered guardians to record their consensus vote. When approvals reach <code className="text-[#00EC97] font-mono">guardian_threshold</code>, the vault unlocks immediately without waiting for the heartbeat timeout.
                </p>
              </div>

              {/* Method 4 */}
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-[#00EC97]">
                    claim_vault(vault_id: U64)
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/[0.08]">
                    Change
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Allows designated beneficiaries to claim the vault once it is unlocked (either via heartbeat expiration or guardian quorum). Records an immutable claim audit log on NEAR.
                </p>
              </div>

              {/* Method 5 */}
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono font-bold text-[#00EC97]">
                    get_vault(vault_id: U64) -&gt; Option&lt;VaultView&gt;
                  </code>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00EC97]/15 text-[#00EC97] border border-[#00EC97]/30">
                    View
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Returns public vault status, remaining time until unlock, guardian quorum counts, and metadata CID without consuming any gas fees.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Storage & Access Keys */}
          <section id="storage-staking" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiShield className="text-[#00EC97]" />
              NEAR Storage Staking &amp; Function-Call Access Keys
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              NEAR Protocol utilizes a storage staking model (~1 NEAR per 100 KB) and granular Function-Call Access Keys that make autonomous custody reliable and safe:
            </p>
            <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] font-mono text-xs text-slate-200 space-y-2">
              <div className="text-slate-400">// Scoped Function-Call Key authorization:</div>
              <div>Receiver ID: <span className="text-[#00EC97]">&quot;hierkey.testnet&quot;</span></div>
              <div>Method Names: <span className="text-[#00EC97]">[&quot;prove_life&quot;]</span></div>
              <div>Gas Allowance: <span className="text-[#00EC97]">0.25 NEAR</span> (no fund transfer privileges)</div>
            </div>
          </section>

          {/* Section: Testing & Verification */}
          <section id="testing" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiCheckCircle className="text-[#00EC97]" />
              Testing &amp; Quality Verification (Rust near-sdk &amp; Vitest)
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Hierkey maintains strict test coverage across smart contracts and client cryptographic modules.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#00EC97]">
                    1. Run NEAR Smart Contract Tests (Rust)
                  </span>
                  <span className="text-[10px] font-mono text-[#00EC97]">5 / 5 Passing</span>
                </div>
                <div className="bg-[#070A0E] p-2.5 rounded border border-white/[0.08] font-mono text-xs text-slate-300 flex items-center justify-between">
                  <code>cargo test --manifest-path contracts-near/Cargo.toml</code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        "cargo test --manifest-path contracts-near/Cargo.toml",
                        "Rust test command"
                      )
                    }
                    className="text-[#00EC97] hover:text-white"
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tests vault creation, heartbeat timeouts, authorized keeper delegation, guardian quorum, and emergency unlock consensus.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#00EC97]">
                    2. Run Frontend Cryptographic Suite (Vitest)
                  </span>
                  <span className="text-[10px] font-mono text-[#00EC97]">Passing</span>
                </div>
                <div className="bg-[#070A0E] p-2.5 rounded border border-white/[0.08] font-mono text-xs text-slate-300 flex items-center justify-between">
                  <code>npm test -- --run</code>
                  <button
                    onClick={() => copyToClipboard("npm test -- --run", "Vitest test command")}
                    className="text-[#00EC97] hover:text-white"
                  >
                    <FiCopy />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Verifies client-side ECIES encryption, Shamir Secret Sharing shard recovery, and SessionLockGate privacy guards.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Deployment */}
          <section id="deployment" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiTerminal className="text-[#00EC97]" />
              Deployment &amp; Reproduction Guide
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To deploy your own instance of the Hierkey NEAR contract to NEAR Testnet:
            </p>
            <div className="p-4 rounded-xl bg-[#070A0E] border border-white/[0.08] font-mono text-xs text-slate-300 space-y-3">
              <div>
                <span className="text-[#00EC97]"># 1. Compile NEAR WASM bytecode:</span>
                <div className="text-slate-200 mt-0.5">cargo build --manifest-path contracts-near/Cargo.toml --target wasm32-unknown-unknown --release</div>
              </div>
              <div>
                <span className="text-[#00EC97]"># 2. Deploy to NEAR Testnet:</span>
                <div className="text-slate-200 mt-0.5">node scripts/deploy-near.mjs</div>
              </div>
              <div>
                <span className="text-[#00EC97]"># 3. Run Automated Keeper Heartbeat Relay:</span>
                <div className="text-slate-200 mt-0.5">node scripts/keeper-relay-near.mjs</div>
              </div>
            </div>
          </section>

          {/* Section: Grants & Hackathon */}
          <section id="grants" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiAward className="text-[#00EC97]" />
              NEAR Ecosystem &amp; Hackathon 2026
            </h2>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0E141E] to-[#121A28] border border-white/[0.08] space-y-3">
              <div className="text-sm font-bold text-white">
                Engineered for NEAR Protocol Hackathon 2026
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hierkey is built natively on NEAR Protocol to demonstrate the unique advantages of NEAR&apos;s Account Model, Function-Call Access Keys, and low-latency sharded execution for trustless cryptographic custody.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="https://near.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] inline-flex items-center gap-1.5"
                >
                  <span>NEAR Protocol</span>
                  <FiExternalLink className="text-[10px]" />
                </a>
                <a
                  href="https://testnet.nearblocks.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] inline-flex items-center gap-1.5"
                >
                  <span>NEAR Explorer</span>
                  <FiExternalLink className="text-[10px]" />
                </a>
              </div>
            </div>
          </section>

          {/* Section: Maintainers */}
          <section id="maintainers" className="space-y-4 scroll-mt-24">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <FiUsers className="text-[#00EC97]" />
              Maintainers &amp; Contributors
            </h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0E141E] border border-white/[0.08] flex items-center gap-3">
                <img
                  src="https://github.com/bamiebot-maker.png"
                  alt="Ibrahim Sobur Bamidele"
                  className="w-12 h-12 rounded-full border border-[#00EC97]/40 object-cover"
                />
                <div>
                  <div className="text-sm font-bold text-white">Ibrahim Sobur Bamidele</div>
                  <div className="text-xs text-[#00EC97]">Founder, Lead Full-Stack &amp; Smart Contract Developer</div>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href="https://github.com/bamiebot-maker"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>@bamiebot-maker</span>
                      <FiExternalLink className="text-[9px]" />
                    </a>
                    <a
                      href="https://x.com/bamietech_dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#00EC97] hover:underline flex items-center gap-1"
                    >
                      <span>@bamietech_dev</span>
                      <FiExternalLink className="text-[9px]" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Callout */}
          <div className="p-6 rounded-2xl bg-[#0E141E] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-white">Ready to safeguard your legacy?</div>
              <div className="text-xs text-slate-400 mt-1">
                Launch the application and test the Dead Man&apos;s Switch on NEAR Testnet.
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-950 bg-[#00EC97] hover:bg-[#00d688] shadow-lg shadow-[#00EC97]/20 transition-all shrink-0"
            >
              Open Hierkey App
            </Link>
          </div>
        </main>
      </div>

      {/* Standalone Docs Footer */}
      <footer className="border-t border-white/[0.08] bg-[#070A0E] py-8 px-4 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo className="w-5 h-5" />
            <span className="text-slate-400 font-medium">Hierkey Documentation</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-slate-500">NEAR Protocol Network</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/" className="hover:text-[#00EC97]">Home</Link>
            <Link to="/dashboard" className="hover:text-[#00EC97]">App</Link>
            <a href="https://github.com/hierkey" target="_blank" rel="noopener noreferrer" className="hover:text-[#00EC97]">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
