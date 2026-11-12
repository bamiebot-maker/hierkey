import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Avatar, Tooltip } from "@heroui/react";
import {
  FiHome,
  FiShield,
  FiFile,
  FiKey,
  FiUser,
  FiPlus,
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
  FiUnlock,
  FiBell,
  FiBook,
  FiActivity,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";
import { useWeb3 } from "../context/Web3Context";
import { contractService } from "../services/contract.service";
import { shortenAddress } from "../utils/helpers";
import { toast } from "react-hot-toast";
import { buttonClasses } from "../utils/buttonClasses";
import BrandLogo from "../components/BrandLogo";
import OfflineBanner from "../components/offline/OfflineBanner";

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    account,
    isConnected,
    disconnect,
    openConnectModal,
  } = useWeb3();
  const [nickname, setNickname] = useState("");
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [desktopSidebarExpanded, setDesktopSidebarExpanded] = useState(true);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const readProfile = () => {
      try {
        const stored = localStorage.getItem("hierkey-profile") || localStorage.getItem("hierkey-profile");
        if (stored) {
          const parsed = JSON.parse(stored) as { nickname?: string };
          setNickname(parsed.nickname ?? "");
        } else {
          setNickname("");
        }
      } catch {
        setNickname("");
      }
    };

    readProfile();

    const handleProfileUpdate = () => readProfile();
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "hierkey-profile" || event.key === "hierkey-profile") {
        readProfile();
      }
    };

    window.addEventListener(
      "hierkey-profile-updated",
      handleProfileUpdate as EventListener
    );
    window.addEventListener(
      "hierkey-profile-updated",
      handleProfileUpdate as EventListener
    );
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(
        "hierkey-profile-updated",
        handleProfileUpdate as EventListener
      );
      window.removeEventListener(
        "hierkey-profile-updated",
        handleProfileUpdate as EventListener
      );
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/analytics", label: "Analytics", icon: FiActivity },
    { path: "/vaults", label: "Access Vaults", icon: FiShield },
    { path: "/documents", label: "Documents", icon: FiFile },
    { path: "/access", label: "My Access", icon: FiUnlock },
    { path: "/nfts", label: "Access Passes", icon: FiKey },
    { path: "/docs", label: "Docs & Guides", icon: FiBook },
    { path: "/profile", label: "Profile", icon: FiUser },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleCreateVault = () => {
    if (!isConnected) {
      toast.error("Please connect your NEAR Wallet wallet first");
      return;
    }
    navigate("/vaults?create=true");
  };

  const displayName =
    nickname || (account ? shortenAddress(account, 4) : "Guest");

  type ProfileMenuTone = "default" | "warning" | "danger";
  type ProfileMenuItem = {
    key: string;
    label: string;
    tone: ProfileMenuTone;
    onClick: () => void;
  };

  const profileMenuItems = useMemo(
    (): ProfileMenuItem[] => [
      {
        key: "profile",
        label: "Profile",
        tone: "default",
        onClick: () => navigate("/profile"),
      },
      {
        key: "access",
        label: "My Access",
        tone: "default",
        onClick: () => navigate("/access"),
      },
      {
        key: "copy",
        label: "Copy Address",
        tone: "default",
        onClick: () => {
          navigator.clipboard.writeText(account || "");
          toast.success("Address copied");
        },
      },
      {
        key: "disconnect",
        label: "Disconnect",
        tone: "danger",
        onClick: disconnect,
      },
    ],
    [account, disconnect, navigate]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hierkey-desktop-sidebar-expanded") || localStorage.getItem("hierkey-desktop-sidebar-expanded");
      if (stored !== null) {
        setDesktopSidebarExpanded(stored === "1");
      }
    } catch {
      setDesktopSidebarExpanded(true);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "hierkey-desktop-sidebar-expanded",
        desktopSidebarExpanded ? "1" : "0"
      );
    } catch {
      // ignore storage errors
    }
  }, [desktopSidebarExpanded]);

  useEffect(() => {
    setDesktopMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    const loadPendingApprovalCount = async () => {
      if (!account || !isConnected) {
        setPendingApprovalCount(0);
        return;
      }
      try {
        const approvals =
          await contractService.fetchPendingApprovalsForGuardian(account, 20);
        if (!cancelled) {
          setPendingApprovalCount(approvals.length);
        }
      } catch {
        if (!cancelled) {
          setPendingApprovalCount(0);
        }
      }
    };

    void loadPendingApprovalCount();
    const interval = window.setInterval(loadPendingApprovalCount, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [
    account,
    isConnected,
    location.pathname,
  ]);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (desktopMenuRef.current && !desktopMenuRef.current.contains(target)) {
        setDesktopMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopMenuOpen(false);
        setMobileDrawerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const profileMenuItemClass = (tone: ProfileMenuTone) =>
    `w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
      tone === "danger"
        ? "text-red-300 hover:bg-red-500/15"
        : tone === "warning"
        ? "text-yellow-300 hover:bg-yellow-500/15"
        : "text-gray-200 hover:bg-gray-800/80"
    }`;

  const toggleDesktopSidebar = () => {
    setDesktopMenuOpen(false);
    setDesktopSidebarExpanded((prev) => !prev);
  };

  const openApprovalQueue = () => {
    navigate("/dashboard#approval-queue");
  };

  const canCreateVault = isConnected;

  return (
    <div className="app-shell-bg min-h-screen">
      <OfflineBanner />
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen border-r border-gray-800/80 bg-gray-950/95 backdrop-blur-2xl z-50 shadow-[18px_0_40px_-34px_rgba(0,0,0,0.95)] transition-[width] duration-300 overflow-visible ${
          desktopSidebarExpanded ? "w-[20rem]" : "w-[4.5rem]"
        }`}
      >
        {/* Left Icon Rail */}
        <div className="w-[4.5rem] border-r border-gray-800/80 px-2 py-4 flex flex-col items-center justify-between h-full flex-shrink-0">
          <div className="w-full flex flex-col items-center">
            {/* Traffic Dots */}
            <div className="flex items-center gap-1.5 pb-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/90" />
            </div>

            {/* Row 0: Logo (Height matches Header card: 48px) */}
            <Tooltip content="Open dashboard" placement="right" delay={150}>
              <Link to="/dashboard" className="mb-2 group">
                <div className="w-11 h-12 rounded-xl bg-white/5 border border-gray-700/70 flex items-center justify-center shadow-lg shadow-black/50 group-hover:border-[#00EC97]/60 transition-colors">
                  <BrandLogo className="w-7 h-7" />
                </div>
              </Link>
            </Tooltip>

            {/* Row 1: Status & Queue Icon (Height matches Status chip: 38px) */}
            <Tooltip
              content={
                pendingApprovalCount > 0
                  ? `Approval Queue: ${pendingApprovalCount} pending`
                  : !isConnected
                  ? "NEAR Wallet Disconnected"
                  : "NEAR Testnet"
              }
              placement="right"
              delay={150}
            >
              <button
                type="button"
                onClick={openApprovalQueue}
                className="mb-3 w-11 h-[38px] rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-[#00EC97] transition-colors hover:border-[#00EC97]/50"
              >
                {pendingApprovalCount > 0 ? (
                  <div className="relative">
                    <FiBell className="text-brand-300 text-[15px]" />
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                  </div>
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      !isConnected
                        ? "bg-gray-500"
                        : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    }`}
                  />
                )}
              </button>
            </Tooltip>

            {/* Rows 2-9: Navigation Icons (Aligned pixel-for-pixel with right panel items) */}
            <nav className="w-full space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Tooltip
                    key={`rail-tooltip-${item.path}`}
                    content={item.label}
                    placement="right"
                    delay={120}
                  >
                    <Link
                      key={`rail-${item.path}`}
                      to={item.path}
                      className={`mx-auto flex h-11 w-11 items-center justify-center rounded-xl border transition-all ${
                        active
                          ? "bg-[#00EC97]/15 border-[#00EC97]/50 text-[#00EC97] shadow-[0_4px_16px_-6px_rgba(0,236,151,0.4)]"
                          : "border-transparent text-gray-500 hover:text-gray-200 hover:border-gray-700/70 hover:bg-gray-900/80"
                      }`}
                    >
                      <Icon className="text-[17px]" />
                    </Link>
                  </Tooltip>
                );
              })}
            </nav>
          </div>

          {/* Bottom Actions: Create Vault & Profile Avatar */}
          <div className="w-full space-y-2 border-t border-gray-800/70 pt-2 flex flex-col items-center">
            <Tooltip content="Create access vault" placement="right" delay={120}>
              <Button
                isIconOnly
                onPress={handleCreateVault}
                isDisabled={!canCreateVault}
                className={`mx-auto w-11 h-11 min-w-11 rounded-xl border ${
                  canCreateVault
                    ? "border-[#00EC97]/40 bg-[#00EC97]/15 text-[#00EC97] hover:bg-emerald-700/30 shadow-[0_4px_14px_-6px_rgba(0,236,151,0.6)]"
                    : "border-gray-800/80 bg-gray-900/55 text-gray-600"
                }`}
                aria-label="Create access vault"
              >
                <FiPlus className="text-[17px]" />
              </Button>
            </Tooltip>

            <Tooltip
              content={isConnected ? displayName : "Connect Wallet"}
              placement="right"
              delay={120}
            >
              <Link
                to="/profile"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white text-xs font-bold border border-[#00EC97]/40 shadow-md"
              >
                {account ? account.substring(0, 2).toUpperCase() : <FiUser className="text-[16px]" />}
              </Link>
            </Tooltip>
          </div>
        </div>

        {/* Right Expanded Panel (aligned row-for-row with the Left Rail) */}
        {desktopSidebarExpanded && (
          <div className="flex-1 min-w-0 p-3 flex flex-col justify-between h-full">
            <div>
              {/* Row 0: App Title Header & Collapse Button (Height: 48px) */}
              <div className="h-12 mb-2 flex items-center gap-2">
                <div className="flex-1 min-w-0 h-12 rounded-xl border border-gray-800/80 bg-gray-900/60 px-3 flex flex-col justify-center">
                  <p className="text-sm font-bold truncate text-white">Hierkey</p>
                  <p className="text-[11px] text-emerald-400 font-medium truncate">
                    NEAR Protocol Custody
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleDesktopSidebar}
                  className="h-12 w-10 flex-shrink-0 inline-flex items-center justify-center rounded-xl border border-gray-700/80 bg-gray-900/85 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <FiChevronLeft className="text-[16px]" />
                </button>
              </div>

              {/* Row 1: Network Badge & Approval Queue (Height: 38px) */}
              <div className="h-[38px] mb-3 flex items-center gap-2">
                <div className="flex-1 min-w-0 h-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-2.5 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      !isConnected
                        ? "bg-gray-500"
                        : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    }`}
                  />
                  <p className="text-[11px] font-semibold truncate text-slate-100">
                    {!isConnected ? "NEAR Wallet Disconnected" : "NEAR Testnet"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openApprovalQueue}
                  className={`h-full px-2.5 rounded-xl border flex items-center gap-1.5 transition-colors text-xs font-medium flex-shrink-0 ${
                    pendingApprovalCount > 0
                      ? "border-[#00EC97]/40 bg-[#00EC97]/15 text-slate-100"
                      : "border-gray-800/80 bg-gray-900/65 text-gray-400 hover:bg-gray-900/85"
                  }`}
                >
                  <FiBell className="text-[13px]" />
                  <span>{pendingApprovalCount}</span>
                </button>
              </div>

              {/* Rows 2-9: Navigation Links (Height: 44px each, space-y-1.5, matching left rail) */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={`panel-${item.path}`}
                      to={item.path}
                      className={`h-11 flex items-center gap-3 rounded-xl border px-3 transition-all ${
                        active
                          ? "border-[#00EC97]/50 bg-gradient-to-r from-[#00EC97]/20 to-emerald-900/20 text-white font-semibold shadow-[0_2px_10px_-4px_rgba(0,236,151,0.5)]"
                          : "border-transparent text-gray-400 hover:text-gray-100 hover:border-gray-800/80 hover:bg-gray-900/70"
                      }`}
                    >
                      <Icon
                        className={`text-base ${
                          active ? "text-[#00EC97]" : "text-gray-500"
                        }`}
                      />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Actions: Create Vault & User Profile Card */}
            <div className="pt-2 border-t border-gray-800/70 space-y-2">
              <Button
                onPress={handleCreateVault}
                isDisabled={!canCreateVault}
                className={
                  canCreateVault
                    ? `w-full h-11 ${buttonClasses.primarySm} shadow-md`
                    : "w-full h-11 rounded-xl border border-gray-800/80 bg-gray-900/70 text-gray-500 text-xs font-medium"
                }
                startContent={<FiPlus className="text-base" />}
              >
                Create Access Vault
              </Button>

              {isConnected ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-gray-800/80 bg-gray-900/70 p-2">
                  <Avatar
                    className="bg-white/10 flex-shrink-0 text-xs font-bold"
                    name={nickname || account?.substring(2, 6)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate text-gray-200">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-mono truncate">
                      {shortenAddress(account || "", 4)}
                    </p>
                  </div>
                  <div className="relative" ref={desktopMenuRef}>
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                      onPress={() => {
                        setDesktopMenuOpen((open) => !open);
                      }}
                      aria-label="Open profile menu"
                    >
                      <FiMoreHorizontal />
                    </Button>

                    {desktopMenuOpen && (
                      <div className="absolute right-0 bottom-10 z-40 w-44 rounded-xl border border-gray-700/80 bg-gray-950/95 p-1 shadow-2xl">
                        {profileMenuItems.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className={profileMenuItemClass(item.tone)}
                            onClick={() => {
                              item.onClick();
                              setDesktopMenuOpen(false);
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!desktopSidebarExpanded && (
          <button
            type="button"
            onClick={toggleDesktopSidebar}
            aria-label="Expand sidebar"
            className="group absolute -right-5 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl border border-gray-700/80 bg-gray-900/95 text-gray-300 shadow-[0_18px_30px_-20px_rgba(0,0,0,0.95)] hover:border-gray-500 hover:text-white transition-all"
          >
            <FiChevronRight className="mx-auto text-[16px]" />
          </button>
        )}
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-40 border-b border-gray-800/80 bg-gray-950/92 backdrop-blur-2xl">
        <div className="h-16 px-3.5 flex items-center justify-between gap-2">
          {/* Left: Hamburger menu toggle + Brand Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileDrawerOpen(true)}
              className="w-10 h-10 rounded-xl border border-gray-800 bg-gray-900/80 flex items-center justify-center text-gray-300 hover:text-white hover:border-gray-700 transition-colors flex-shrink-0"
            >
              <FiMenu className="text-[18px]" />
            </button>
            <Link
              to="/dashboard"
              className="min-w-0 flex items-center gap-2 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center shadow-lg shadow-emerald-900/30 flex-shrink-0">
                <BrandLogo className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold leading-none text-white truncate">
                  Hierkey
                </p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5 truncate">
                  NEAR CUSTODY
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Notifications + Wallet Pill */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isConnected && (
              <button
                type="button"
                aria-label="Open approval queue"
                onClick={openApprovalQueue}
                className={`relative w-9 h-9 rounded-xl border text-gray-300 flex items-center justify-center transition-colors ${
                  pendingApprovalCount > 0
                    ? "border-brand-700/60 bg-brand-700/12 text-brand-300 shadow-[0_10px_20px_-16px_rgba(185,28,28,0.9)]"
                    : "border-gray-700/75 bg-gray-900/75 hover:border-gray-600 hover:text-gray-100"
                }`}
              >
                <FiBell
                  className={`text-[14px] ${
                    pendingApprovalCount > 0 ? "text-brand-300" : ""
                  }`}
                />
                {pendingApprovalCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1rem] h-4 px-1 rounded-full bg-brand-700 text-[10px] font-semibold text-white leading-none inline-flex items-center justify-center">
                    {pendingApprovalCount > 9 ? "9+" : pendingApprovalCount}
                  </span>
                )}
              </button>
            )}

            {!isConnected ? (
              <Button
                size="sm"
                onClick={openConnectModal}
                className="h-9 px-3 rounded-xl font-bold text-xs bg-[#00EC97] text-gray-950 text-white shadow-md shadow-emerald-900/40"
              >
                Connect
              </Button>
            ) : (
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-700/80 bg-gray-900/80 text-xs text-gray-200 hover:border-emerald-500/60 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="font-mono text-[11px]">
                  {account ? shortenAddress(account) : "Connected"}
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Sliding Drawer Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Sliding Drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[84vw] max-w-[320px] bg-gray-950 border-r border-gray-800 p-5 flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation drawer"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Drawer Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
            <Link
              to="/dashboard"
              onClick={() => setMobileDrawerOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-[#00EC97]/40 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <BrandLogo className="w-5 h-5" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-none">Hierkey</p>
                <p className="text-[10px] text-emerald-400 font-mono mt-1">
                  NEAR PROTOCOL
                </p>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Close navigation drawer"
              onClick={() => setMobileDrawerOpen(false)}
              className="w-9 h-9 rounded-xl border border-gray-800 bg-gray-900/60 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Connected User / Account Badge */}
          <div className="mt-4 p-3 rounded-2xl border border-gray-800/90 bg-gray-900/40">
            {isConnected ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      className="w-7 h-7 bg-gradient-to-br from-brand-700 to-brand-900 text-xs"
                      name={nickname || account?.substring(2, 6)}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {nickname || (account ? shortenAddress(account) : "Connected")}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono truncate">
                        {account ? `${account.slice(0, 10)}...` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-[#00EC97] border border-[#00EC97]/30">
                    NEAR
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-1">
                <p className="text-xs text-gray-400 mb-2">No wallet connected</p>
                <Button
                  size="sm"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    openConnectModal();
                  }}
                  className="w-full h-8 rounded-xl bg-[#00EC97] hover:bg-[#00d688] text-gray-950 font-bold font-bold text-xs"
                >
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={`drawer-${item.path}`}
                  to={item.path}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "bg-[#00EC97]/15 border border-[#00EC97]/40 text-slate-100 shadow-sm"
                      : "text-gray-400 hover:text-gray-100 hover:bg-gray-900/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`text-base ${active ? "text-[#00EC97]" : "text-gray-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00EC97] shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Drawer Footer Actions */}
          <div className="pt-4 mt-4 border-t border-gray-800/80 space-y-2">
            {isConnected && (
              <button
                type="button"
                onClick={() => {
                  disconnect({ notify: true });
                  setMobileDrawerOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-900/40 bg-red-950/20 text-red-300 text-xs font-semibold hover:bg-red-950/40 transition-colors"
              >
                <FiLogOut className="text-sm" />
                <span>Disconnect Wallet</span>
              </button>
            )}

            <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 pt-1 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Testnet Live</span>
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </aside>

      <main
        className={`min-h-screen pt-20 pb-8 lg:pt-0 lg:pb-0 transition-[margin] duration-300 ${
          desktopSidebarExpanded ? "lg:ml-[20rem]" : "lg:ml-[4.5rem]"
        }`}
      >
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
