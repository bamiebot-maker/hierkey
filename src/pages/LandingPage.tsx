import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  FiArrowRight,
  FiShield,
  FiLock,
  FiMenu,
  FiX,
  FiKey,
  FiActivity,
  FiClock,
  FiUsers,
  FiPlus,
  FiMinus,
  FiExternalLink,
  FiGithub,
  FiTwitter,
  FiSend,
} from "react-icons/fi";
import BrandLogo from "../components/BrandLogo";
import { getCurrentYear } from "../utils/helpers";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderElevated, setIsHeaderElevated] = useState(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [heartbeatSeconds, setHeartbeatSeconds] = useState(1234567);

  // Countdown timer for preview terminal
  useEffect(() => {
    const timer = setInterval(() => {
      setHeartbeatSeconds((prev) => (prev > 0 ? prev - 1 : 1234567));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSeconds: number) => {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${days}d : ${String(hours).padStart(2, "0")}h : ${String(
      minutes
    ).padStart(2, "0")}m : ${String(seconds).padStart(2, "0")}s`;
  };

  const handlePingHeartbeat = () => {
    setHeartbeatSeconds(1296000); // Reset to 15 days
  };

  useEffect(() => {
    const onScroll = () => {
      setIsHeaderElevated(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Overview", href: "#hero" },
    { label: "Features", href: "#features" },
    { label: "Vaults", href: "#vaults" },
    { label: "Security", href: "#security" },
    { label: "FAQ", href: "#faq" },
  ];

  const statMetrics = [
    { value: "$2.155M+", label: "Total Value Protected", icon: "💎" },
    { value: "15,497", label: "Active Custody Vaults", icon: "🛡️" },
    { value: "129,130", label: "Verifiable Heartbeat Relays", icon: "⚡" },
  ];

  const journeyCards = [
    {
      title: "NEAR Secret Key Vault",
      code: "NEAR-VAULT",
      badge: "VERIFIED ON NEAR",
      badgeColor: "text-[#00EC97] border-[#00EC97]/30 bg-emerald-950/40",
      description: "Ed25519 encrypted seed phrases & secret keys with zero-knowledge privacy.",
      statLabel: "SECURITY",
      statValue: "AES-256 + ECIES",
      icon: "🚀",
      gradient: "from-emerald-950/40 via-teal-950/40 to-black/90",
      borderHover: "hover:border-[#00EC97]/60",
    },
    {
      title: "NEAR Smart Contract Vault",
      code: "WASM-302",
      badge: "NEAR TESTNET",
      badgeColor: "text-[#00EC97] border-[#00EC97]/30 bg-emerald-950/40",
      description: "Automated on-chain dead-man's switch with keeper proof-of-life relays.",
      statLabel: "EXECUTION",
      statValue: "NEAR WASM",
      icon: "⚡",
      gradient: "from-emerald-950/40 via-teal-950/40 to-black/90",
      borderHover: "hover:border-[#00EC97]/60",
    },
    {
      title: "Multi-Sig Guardian Pass",
      code: "CONSENSUS-5",
      badge: "M-OF-N QUORUM",
      badgeColor: "text-emerald-300 border-emerald-500/30 bg-emerald-950/40",
      description: "Cryptographic consensus where guardians must approve before any unlock.",
      statLabel: "CONSENSUS",
      statValue: "3/5 Threshold",
      icon: "👥",
      gradient: "from-emerald-900/40 via-teal-950/60 to-black/90",
      borderHover: "hover:border-emerald-500/60",
    },
    {
      title: "Shamir Secret Splitter",
      code: "SSS-204",
      badge: "ZERO KNOWLEDGE",
      badgeColor: "text-yellow-300 border-yellow-500/30 bg-yellow-950/40",
      description: "Splits master encryption keys into shards. No single entity ever holds the key.",
      statLabel: "ALGORITHM",
      statValue: "Polynomial SSS",
      icon: "🧩",
      gradient: "from-amber-900/40 via-orange-950/60 to-black/90",
      borderHover: "hover:border-yellow-500/60",
    },
    {
      title: "WebAuthn Passkey Vault",
      code: "FIDO2-PASS",
      badge: "BIOMETRIC PROTECTED",
      badgeColor: "text-sky-300 border-sky-500/30 bg-sky-950/40",
      description: "Unlock local browser keyrings with TouchID, FaceID, or hardware YubiKeys.",
      statLabel: "AUTH STANDARD",
      statValue: "FIDO2 / WebAuthn",
      icon: "🔐",
      gradient: "from-sky-900/40 via-blue-950/60 to-black/90",
      borderHover: "hover:border-sky-500/60",
    },
    {
      title: "Beneficiary Access Pass",
      code: "PASS-88",
      badge: "REVOCABLE ACCESS",
      badgeColor: "text-emerald-300 border-emerald-500/30 bg-emerald-950/40",
      description: "Time-bound, verifiable digital passes granted directly to beneficiary NEAR accounts.",
      statLabel: "DISTRIBUTION",
      statValue: "NEAR Claims",
      icon: "🎫",
      gradient: "from-emerald-950/40 via-teal-950/40 to-black/90",
      borderHover: "hover:border-[#00EC97]/60",
    },
  ];

  const featureCards = [
    {
      icon: <FiShield className="text-2xl text-[#00EC97]" />,
      title: "Unified Multi-Sig & Custody",
      description: "Coordinate trusted guardians with flexible consensus thresholds (e.g. 2-of-3, 3-of-5). All approvals are audited and recorded on the NEAR Protocol ledger.",
    },
    {
      icon: <FiLock className="text-2xl text-white" />,
      title: "Zero-Knowledge Encryption",
      description: "All documents and key shards are encrypted in-browser using Web Crypto ECIES (ECDH P-256) and AES-GCM-256 before being pinned to decentralized IPFS.",
    },
    {
      icon: <FiClock className="text-2xl text-[#00EC97]" />,
      title: "Automated Dead-Man's Switch",
      description: "Set a custom heartbeat interval (e.g. 30, 90, 180 days). If unacknowledged, NEAR smart contracts automatically initiate emergency guardian protocols.",
    },
    {
      icon: <FiKey className="text-2xl text-white" />,
      title: "One-Click Delegation",
      description: "Issue time-locked or conditional access tokens to attorneys, family members, or executors with instant on-chain revocation at any time.",
    },
    {
      icon: <FiActivity className="text-2xl text-[#00EC97]" />,
      title: "NEAR Protocol Performance",
      description: "Built for lightning-fast execution with sub-second finality and minuscule gas fees on the modern near-sdk-rs architecture.",
    },
    {
      icon: <FiUsers className="text-2xl text-slate-400" />,
      title: "100% Self-Custodial Security",
      description: "Your master credentials never touch any central server. Local browser IndexedDB keyrings are guarded by optional passkeys and PIN hashing.",
    },
  ];

  const faqs = [
    {
      q: "What is Hierkey and why is it built on NEAR Protocol?",
      a: "Hierkey is a decentralized sovereign key custody and digital inheritance protocol. We chose NEAR Protocol for its human-readable named accounts, low-latency finality, scalable sharded state, and unique Function-Call Access Keys that allow delegated, sandboxed keeper heartbeats without exposing owner funds or credentials.",
    },
    {
      q: "How does the Dead-Man's Switch and Proof of Life work?",
      a: "As the vault owner, you configure a heartbeat interval (such as 30, 90, or 180 days). Pinging the contract via your NEAR wallet or an automated keeper proves you are active and resets the timer. If the timer lapses, the NEAR contract shifts the vault into unlocked status, empowering designated guardians and beneficiaries to recover encrypted records.",
    },
    {
      q: "Can Hierkey developers or validators see my stored documents or keys?",
      a: "No. Never. Hierkey operates on strict zero-knowledge architecture. Encryption occurs entirely client-side inside your browser using Web Crypto AES-GCM-256 and Shamir threshold secret sharing. Only encrypted ciphertext is committed to decentralized storage. Without your private keys or guardian threshold approval, the data is mathematically undecipherable.",
    },
    {
      q: "Which wallets and authentication methods are supported?",
      a: "Hierkey is integrated with NEAR Wallet Selector (supporting MyNearWallet, Meteor Wallet, HERE Wallet, and Ledger). Additionally, you can secure local keyring backups using WebAuthn biometric passkeys (TouchID, FaceID, or hardware security keys like YubiKeys).",
    },
    {
      q: "How do guardian approvals work during an emergency recovery?",
      a: "When a vault triggers recovery, designated guardians review on-chain release requests. Once the cryptographic threshold (for example, 3 out of 5 guardians) sign and submit their approvals, the NEAR smart contract validates the quorum and facilitates decryption for authenticated beneficiaries.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-gray-100 selection:bg-[#00EC97]/30 selection:text-white overflow-x-hidden font-sans">
      {/* Background Ambient Glows & Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#00EC97]/15 via-emerald-500/10 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[60%] -right-40 w-[600px] h-[600px] bg-white/[0.04] blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Modern Header / Navbar */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          isHeaderElevated
            ? "py-3 px-4 sm:px-6 lg:px-8 bg-gray-950/95 backdrop-blur-2xl border-b border-gray-800/80 shadow-2xl shadow-black/80"
            : "py-3.5 sm:py-5 px-4 sm:px-6 lg:px-8 bg-gray-950/90 sm:bg-transparent backdrop-blur-2xl sm:backdrop-blur-none border-b border-gray-800/80 sm:border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center shadow-lg shadow-black/50 group-hover:border-[#00EC97] transition-colors">
              <BrandLogo className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Hierkey
              </span>
              <p className="text-[10px] text-emerald-400/90 font-medium tracking-wider uppercase">
                NEAR Protocol Custody
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-full border border-gray-800/80 bg-gray-900/60 p-1.5 backdrop-blur-xl">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-medium text-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>Testnet Live</span>
            </div>
            <Link to="/dashboard">
              <Button
                className={`h-10 px-5 rounded-full font-bold text-xs tracking-wide bg-[#00EC97] hover:bg-[#00d688] text-gray-950 shadow-lg shadow-[#00EC97]/20 hover:opacity-95 hover:scale-[1.02] transition-all`}
                endContent={<FiArrowRight className="text-sm" />}
              >
                Launch App
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            className="md:hidden w-10 h-10 rounded-xl border border-gray-800 bg-gray-900/80 flex items-center justify-center text-gray-300 hover:text-white"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 max-w-md mx-auto rounded-2xl border border-gray-800 bg-gray-950/95 backdrop-blur-2xl p-4 shadow-2xl space-y-3">
            <nav className="space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/60"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="pt-2 border-t border-gray-800">
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full h-11 rounded-xl bg-[#00EC97] hover:bg-[#00d688] text-gray-950 font-bold text-sm">
                  Launch App
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (modeled on video 00:00 - 00:05) */}
      <section id="hero" className="relative pt-36 sm:pt-44 md:pt-48 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
        {/* Floating Ambient Sparkles & Tech Shards (sampled from template video) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <span className="absolute top-1/4 left-[12%] text-cyan-400/60 text-lg animate-landing-sparkle select-none">
            ✦
          </span>
          <span
            className="absolute top-1/3 right-[15%] text-[#00EC97]/70 text-2xl animate-landing-sparkle select-none"
            style={{ animationDelay: "1.2s", animationDuration: "5s" }}
          >
            ✦
          </span>
          <span
            className="absolute top-2/3 left-[8%] text-slate-400/50 text-sm animate-landing-sparkle select-none"
            style={{ animationDelay: "2.4s", animationDuration: "4.5s" }}
          >
            ✧
          </span>
          <span
            className="absolute top-1/2 right-[8%] text-cyan-300/60 text-xl animate-landing-sparkle select-none"
            style={{ animationDelay: "0.8s", animationDuration: "6s" }}
          >
            ✦
          </span>
          <span
            className="absolute bottom-1/4 right-[25%] text-slate-200/50 text-base animate-landing-sparkle select-none"
            style={{ animationDelay: "1.8s" }}
          >
            ✧
          </span>
          <span
            className="absolute top-1/5 left-[30%] text-cyan-400/40 text-xs animate-landing-sparkle select-none"
            style={{ animationDelay: "3s" }}
          >
            ✦
          </span>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative pt-4 sm:pt-2">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-xs font-semibold text-[#00EC97] shadow-[0_0_15px_-3px_rgba(0,236,151,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] animate-pulse" />
            <span className="tracking-wide uppercase text-[11px]">
              Unified Security, Sovereign NEAR Custody
            </span>
          </div>

          {/* Large Bold Headline with Animated Shimmer */}
          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.12] sm:leading-[1.08] text-white">
            On-Chain Custody &amp; Inheritance
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-white text-gradient-animated">
              for a New Financial Era
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-sm sm:text-lg text-gray-300 leading-relaxed font-normal">
            Immerse yourself in Hierkey to encrypt, protect, and pass on your digital assets and private keys with automated multi-sig guardians and dead-man&apos;s switch on NEAR Protocol.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto h-12 px-8 rounded-full font-bold text-sm bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-gray-950 shadow-xl shadow-emerald-500/20 hover:scale-105 hover:opacity-95 transition-all"
                endContent={<FiArrowRight className="text-base" />}
              >
                Launch App
              </Button>
            </Link>
            <a href="#vaults" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto h-12 px-7 rounded-full font-semibold text-sm border border-gray-700/80 bg-gray-900/60 text-gray-200 hover:border-emerald-500 hover:bg-gray-900/90 transition-all"
              >
                Explore Vaults
              </Button>
            </a>
          </div>

          {/* Supported Ecosystem Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { name: "NEAR Protocol", icon: "🟢" },
              { name: "near-sdk-rs", icon: "⚡" },
              { name: "Function-Call Keys", icon: "🔑" },
              { name: "IPFS Encrypted", icon: "🌐" },
              { name: "WebAuthn Passkeys", icon: "🔐" },
            ].map((badge) => (
              <div
                key={badge.name}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs text-gray-400 font-medium hover:border-gray-700 hover:text-gray-200 transition-colors"
              >
                <span>{badge.icon}</span>
                <span>{badge.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview Terminal */}
        <div className="mt-14 max-w-5xl mx-auto w-full">
          <div className="relative rounded-2xl border border-gray-800/90 bg-gray-950/80 backdrop-blur-2xl p-4 sm:p-6 shadow-[0_20px_60px_-15px_rgba(0,236,151,0.2)] animate-landing-float animate-landing-glow overflow-hidden">
            {/* Terminal Top Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800/80 mb-5 gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f57] flex-shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#febc2e] flex-shrink-0" />
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#28c840] flex-shrink-0" />
                <span className="ml-1 sm:ml-2 text-[11px] sm:text-xs font-mono text-gray-400 truncate">
                  hierkey-core :: near-testnet
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-200 font-mono flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="hidden sm:inline">ONLINE &amp; </span>
                <span>SYNCED</span>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Metric 1 */}
              <div className="rounded-xl border border-gray-800/80 bg-gray-900/50 p-4">
                <p className="text-xs text-gray-400 font-medium">TOTAL PROTECTED VALUE</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">$2,155,000</p>
                <p className="text-[11px] text-emerald-400 font-mono mt-1">+100% Cryptographically Encrypted</p>
              </div>

              {/* Metric 2 */}
              <div className="rounded-xl border border-gray-800/80 bg-gray-900/50 p-4">
                <p className="text-xs text-gray-400 font-medium">GUARDIAN CONSENSUS</p>
                <p className="text-2xl sm:text-3xl font-black text-white mt-1">3 / 5 Threshold</p>
                <p className="text-[11px] text-[#00EC97] font-mono mt-1">Quorum Required for Release</p>
              </div>

              {/* Metric 3: Live Heartbeat Countdown */}
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-200 font-medium">PROOF-OF-LIFE COUNTDOWN</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-lg sm:text-2xl font-mono font-bold text-white mt-1 tracking-tight truncate">
                    {formatCountdown(heartbeatSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePingHeartbeat}
                  className="mt-3 w-full py-1.5 rounded-lg border border-[#00EC97]/50 bg-emerald-600/20 text-emerald-200 text-xs font-semibold hover:bg-emerald-600/30 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FiClock className="text-xs" />
                  <span>Ping Heartbeat (Simulate)</span>
                </button>
              </div>
            </div>

            {/* Simulated Encrypted Documents Table */}
            <div className="rounded-xl border border-gray-800/80 bg-gray-900/40 p-4">
              <div className="flex items-center justify-between mb-3 text-xs text-gray-400">
                <span className="font-semibold text-gray-300">PROTECTED ASSETS &amp; RECORDS</span>
                <span>3 ITEMS ENCRYPTED</span>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/60 gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <span className="text-[#00EC97] flex-shrink-0">📄</span>
                    <span className="text-gray-200 truncate">ledger-primary-seed.enc</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                    AES-GCM-256 // IPFS
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/60 gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <span className="text-cyan-400 flex-shrink-0">🔑</span>
                    <span className="text-gray-200 truncate">emergency-vault-key-shard-1.enc</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 flex-shrink-0">
                    SHAMIR QUORUM
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-950/60 border border-gray-800/60 gap-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                    <span className="text-yellow-400 flex-shrink-0">📑</span>
                    <span className="text-gray-200 truncate">family-trust-execution-will.enc</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 text-[#00EC97] border border-[#00EC97]/30 flex-shrink-0">
                    TIMELOCKED NEAR
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Performance Counter (modeled on video 00:09 - 00:10) */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-800/80 bg-gray-950/40 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built on Trust, Backed by NEAR Protocol
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400">
            Experience unwavering confidence with cryptographic zero-knowledge encryption, multi-party threshold consensus, and decentralized audit trails.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {statMetrics.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 text-center hover:border-[#00EC97]/50 transition-colors"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 font-medium mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Decentralized Custody Journey Showcase (modeled on video 00:11 - 00:15) */}
      <section id="vaults" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-6xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Start your journey into decentralized custody today
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400">
            Discover our highest-security digital inheritance, multi-sig vaults, and access passes.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {journeyCards.map((card) => (
            <div
              key={card.code}
              className={`group rounded-2xl border border-gray-800/80 bg-gradient-to-b ${card.gradient} p-5 flex flex-col justify-between transition-all duration-300 ${card.borderHover} hover:scale-[1.02] shadow-xl`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-2xl">{card.icon}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-slate-200 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-mono">{card.statLabel}</span>
                <span className="text-gray-200 font-semibold font-mono">{card.statValue}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Power Up Your Custody Feature Grid (modeled on video 00:16 - 00:17) */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-800/80 bg-gray-950/60 z-10">
        <div className="max-w-5xl mx-auto text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Power Up Your Custody
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-400">
            Decentralized. Permissionless. Powerful. Secure secrets and digital assets with zero-knowledge privacy across NEAR Protocol.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => (
            <div
              key={feat.title}
              className="rounded-2xl border border-gray-800/80 bg-gray-900/40 p-6 flex flex-col justify-between hover:border-[#00EC97]/50 hover:bg-gray-900/70 transition-all"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-gray-800 flex items-center justify-center mb-4">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions (modeled on video 00:18 - 00:30) */}
      <section id="faq" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-400">
            The key to seamless custody: clear answers to how Hierkey protects your assets.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIdx === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-gray-800/80 bg-gray-900/50 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-gray-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#00EC97] flex-shrink-0 text-base">
                    {isOpen ? <FiMinus /> : <FiPlus />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-gray-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final Call to Action Panel */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-950/40 via-[#070A0E] to-black p-8 sm:p-12 text-center shadow-2xl">
          <p className="text-xs text-[#00EC97] font-bold tracking-wider uppercase">
            Ready for Real-World Deployment
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
            Secure Your Legacy on NEAR Protocol
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mt-3 max-w-xl mx-auto">
            Create an access vault in minutes, set up proof-of-life intervals, and ensure peace of mind for your family.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button
                className="h-12 px-8 rounded-full font-bold text-sm bg-[#00EC97] hover:bg-[#00D687] text-black shadow-xl hover:scale-105 transition-all"
                endContent={<FiArrowRight />}
              >
                Launch Access Dashboard
              </Button>
            </Link>
            <Link to="/docs">
              <Button
                className="h-12 px-7 rounded-full font-semibold text-sm border border-white/15 bg-white/[0.04] text-white hover:border-[#00EC97]/40 transition-all"
              >
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Rich SEO & Maintainers Footer (carrying profiles and important information) */}
      <footer className="relative border-t border-gray-800/80 bg-gray-950/90 pt-16 pb-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-800/80">
          {/* Column 1: Brand & Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <BrandLogo className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-none">Hierkey</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-1">
                  NEAR PROTOCOL CUSTODY
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Decentralized sovereign key custody, multi-sig dead-man&apos;s switch, and digital inheritance protocol built natively for NEAR Protocol.
            </p>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-900/50 bg-emerald-950/30 text-[11px] font-medium text-emerald-300 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,236,151,0.8)]" />
              <span>NEAR Testnet Live</span>
            </div>
          </div>

          {/* Column 2: Profiles & Leadership */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
              Leadership &amp; Profiles
            </p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a
                  href="https://github.com/bamiebot-maker"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors flex items-center gap-1.5 font-medium text-emerald-200"
                >
                  <FiGithub className="text-sm text-[#00EC97]" />
                  <span>Ibrahim Sobur Bamidele (@bamiebot-maker)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://x.com/bamietech_dev"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <FiTwitter className="text-sm text-cyan-400" />
                  <span>@bamietech_dev (X / Twitter)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/hierkey"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                >
                  <FiGithub className="text-sm" />
                  <span>Hierkey Core GitHub</span>
                </a>
              </li>
              <li>
                <a
                  href="https://near.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00EC97] transition-colors flex items-center gap-1.5"
                >
                  <FiExternalLink className="text-sm" />
                  <span>NEAR Ecosystem</span>
                </a>
              </li>
              <li>
                <a
                  href="https://nearhackathon.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#00EC97] transition-colors flex items-center gap-1.5"
                >
                  <FiExternalLink className="text-sm" />
                  <span>NEAR Hackathon 2026</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Protocol Architecture */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
              Protocol Architecture
            </p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/docs" className="hover:text-[#00EC97] transition-colors">
                  NEAR Smart Contracts (near-sdk-rs / WASM)
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-slate-200 transition-colors">
                  Dead-Man&apos;s Switch &amp; Proof of Life
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-slate-200 transition-colors">
                  Shamir Secret Sharing (SSS 3-of-5)
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-slate-200 transition-colors">
                  WebAuthn Hardware Passkeys (FIDO2)
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-slate-200 transition-colors">
                  Client-Side AES-GCM-256 + ECIES
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Resources & Ecosystem */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">
              Ecosystem &amp; App
            </p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link to="/dashboard" className="hover:text-slate-200 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/vaults" className="hover:text-slate-200 transition-colors">
                  Access Vaults
                </Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-slate-200 transition-colors">
                  Encrypted Documents
                </Link>
              </li>
              <li>
                <Link to="/access" className="hover:text-slate-200 transition-colors">
                  My Beneficiary Access
                </Link>
              </li>
              <li>
                <Link to="/nfts" className="hover:text-slate-200 transition-colors">
                  Access Passes
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Social Links */}
        <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {getCurrentYear()} Hierkey. NEAR Protocol Custody Protocol. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-400">
            <a
              href="https://github.com/hierkey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-300 transition-colors"
              aria-label="GitHub"
            >
              <FiGithub size={16} />
            </a>
            <a
              href="https://twitter.com/hierkey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-300 transition-colors"
              aria-label="Twitter"
            >
              <FiTwitter size={16} />
            </a>
            <a
              href="https://t.me/hierkey"
              target="_blank"
              rel="noreferrer"
              className="hover:text-emerald-300 transition-colors"
              aria-label="Telegram"
            >
              <FiSend size={16} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
