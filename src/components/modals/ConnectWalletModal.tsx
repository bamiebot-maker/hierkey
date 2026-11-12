import React, { useState } from "react";
import { Button } from "@heroui/react";
import {
  FiX,
  FiShield,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiLogOut,
  FiEye,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { useWeb3, type NearWalletOption } from "../../context/Web3Context";
import { toast } from "react-hot-toast";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLET_OPTIONS: {
  id: NearWalletOption;
  name: string;
  subtitle: string;
  badge?: string;
}[] = [
  {
    id: "meteor-wallet",
    name: "Meteor Wallet",
    subtitle: "Injected extension & web signer (Recommended)",
    badge: "Recommended",
  },
  {
    id: "here-wallet",
    name: "HERE Wallet",
    subtitle: "Mobile & Web NEAR wallet",
  },
];

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    account,
    isConnected,
    nearBalance,
    isReadOnly,
    connectNear,
    connectNearReadOnly,
    disconnect,
  } = useWeb3();

  const [loadingWallet, setLoadingWallet] = useState<string | null>(null);
  const [showReadOnly, setShowReadOnly] = useState(false);
  const [readOnlyInput, setReadOnlyInput] = useState("hk-owner-455251.testnet");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDirectConnect = async (walletId?: NearWalletOption) => {
    const key = walletId || "selector";
    setLoadingWallet(key);
    try {
      await connectNear(walletId);
    } catch (err: any) {
      toast.error(err?.message || "Failed to connect NEAR wallet");
    } finally {
      setLoadingWallet(null);
    }
  };

  const handleReadOnlySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingWallet("readonly");
    try {
      await connectNearReadOnly(readOnlyInput);
    } catch (err: any) {
      toast.error(err?.message || "Invalid NEAR account ID");
    } finally {
      setLoadingWallet(null);
    }
  };

  const handleCopy = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    toast.success("Account ID copied");
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#070A0E] p-6 shadow-2xl text-gray-100 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{isConnected ? "NEAR Account" : "Connect NEAR Wallet"}</span>
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-950/80 text-[#00EC97] border border-[#00EC97]/30">
                NEAR TESTNET
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {isConnected
                ? "Manage your active NEAR Protocol session"
                : "Choose a NEAR wallet to sign & manage your vaults"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Connected Account Card */}
        {isConnected && account && (
          <div className="mt-4 p-4 rounded-xl border border-[#00EC97]/30 bg-[#00EC97]/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00EC97] shadow-[0_0_8px_rgba(0,236,151,0.8)] flex-shrink-0" />
                <span className="font-mono text-sm font-semibold text-white truncate">
                  {account}
                </span>
                {isReadOnly && (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-gray-300 border border-white/15">
                    Read-Only
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Copy account ID"
              >
                {copied ? <FiCheck size={14} className="text-[#00EC97]" /> : <FiCopy size={14} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-gray-400">
                Balance:{" "}
                <strong className="text-white font-mono">
                  {nearBalance !== null ? `${nearBalance} NEAR` : "—"}
                </strong>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={`https://testnet.nearblocks.io/address/${account}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#00EC97] hover:underline inline-flex items-center gap-1"
                >
                  <span>Explorer</span>
                  <FiExternalLink size={11} />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    disconnect();
                    onClose();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 font-medium transition-colors"
                >
                  <FiLogOut size={11} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Network & Wallet Guidance Callout */}
        <div className="mt-3.5 p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/30 text-xs text-emerald-200/90 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#00EC97]">
            <FiShield size={14} />
            <span>NEAR Testnet Required</span>
          </div>
          <p className="text-[11px] leading-relaxed text-gray-300">
            Ensure your wallet (such as <strong>Meteor Wallet</strong>) is toggled to <strong>Testnet</strong> in its top-left menu (<code>☰</code>). Accounts on Mainnet (<code>.near</code>) cannot connect to testnet contracts.
          </p>
        </div>

        {/* Direct Wallet Options */}
        <div className="mt-4 space-y-2.5">
          {WALLET_OPTIONS.map((wallet) => {
            const isLoading = loadingWallet === wallet.id;
            return (
              <button
                key={wallet.id}
                type="button"
                disabled={loadingWallet !== null}
                onClick={() => handleDirectConnect(wallet.id)}
                className="w-full text-left group relative rounded-xl border border-white/10 bg-white/[0.03] p-3.5 hover:border-[#00EC97]/60 hover:bg-white/[0.06] transition-all flex items-center justify-between gap-3 disabled:opacity-60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-[#00EC97]/30 flex items-center justify-center text-[#00EC97] text-lg font-bold font-mono flex-shrink-0">
                    Ⓝ
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-white group-hover:text-[#00EC97] transition-colors">
                        {wallet.name}
                      </span>
                      {wallet.badge && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-950 text-[#00EC97] border border-[#00EC97]/30">
                          {wallet.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {wallet.subtitle}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/[0.06] group-hover:bg-[#00EC97] text-white group-hover:text-black transition-colors flex-shrink-0">
                  {isLoading ? "..." : "Connect"}
                </span>
              </button>
            );
          })}

          {/* Full Selector Trigger */}
          <Button
            type="button"
            onPress={() => handleDirectConnect()}
            isLoading={loadingWallet === "selector"}
            className="w-full h-10 rounded-xl bg-[#00EC97] hover:bg-[#00D687] text-black font-bold text-xs mt-1"
          >
            Open All NEAR Wallets (Wallet Selector)
          </Button>
        </div>

        {/* Optional Read-Only Preview for Quick Testnet Inspection */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowReadOnly((prev) => !prev)}
            className="w-full flex items-center justify-between text-xs text-gray-400 hover:text-white transition-colors py-1"
          >
            <span className="inline-flex items-center gap-1.5">
              <FiEye size={13} className="text-[#00EC97]" />
              <span>Preview Testnet Account (Read-Only)</span>
            </span>
            {showReadOnly ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>

          {showReadOnly && (
            <form onSubmit={handleReadOnlySubmit} className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={readOnlyInput}
                onChange={(e) => setReadOnlyInput(e.target.value)}
                placeholder="e.g. hierkey.testnet"
                className="flex-1 bg-[#0B1018] border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#00EC97]"
              />
              <Button
                type="submit"
                size="sm"
                isLoading={loadingWallet === "readonly"}
                className="h-8 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15"
              >
                Preview
              </Button>
            </form>
          )}
        </div>

        {/* Features Info Banner */}
        <div className="mt-4 p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-2 text-xs text-gray-300">
          <div className="flex items-center gap-2 text-white font-medium">
            <FiShield className="text-[#00EC97]" />
            <span>Zero-Knowledge Key Custody</span>
          </div>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            Hierkey uses NEAR's native block finality with client-side ECIES encryption and Shamir's Secret Sharing. Master decryption keys are never exposed on-chain.
          </p>
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
            <span>Don't have a testnet account?</span>
            <a
              href="https://testnet.mynearwallet.com"
              target="_blank"
              rel="noreferrer"
              className="text-[#00EC97] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Create testnet wallet</span>
              <FiExternalLink size={10} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
