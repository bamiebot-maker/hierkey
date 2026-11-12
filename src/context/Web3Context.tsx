import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "react-hot-toast";
import { contractService } from "../services/contract.service";
import { nearService } from "../services/near.service";
import { isValidNearAddress } from "../utils/helpers";
import type { BLSKeyPair } from "../types/bls";
import ConnectWalletModal from "../components/modals/ConnectWalletModal";

export type NearWalletOption = "my-near-wallet" | "meteor-wallet" | "here-wallet";

interface Web3ContextType {
  provider: any | null;
  signer: any | null;
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  contract: any | null;
  connect: () => Promise<void>;
  disconnect: (options?: { notify?: boolean }) => void;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  isConnectModalOpen: boolean;
  walletType: "near" | null;
  switchToFuji: () => Promise<void>;
  isFujiNetwork: boolean;
  isStellarNetwork: boolean;
  isNearNetwork: boolean;
  ecosystem: "near";
  setEcosystem: (eco: "near") => void;
  stellarNetwork: string | null;
  nearAccountId: string | null;
  nearBalance: string | null;
  isReadOnly: boolean;
  connectNear: (walletId?: NearWalletOption) => Promise<void>;
  connectNearReadOnly: (accountId: string) => Promise<void>;
  blsKeyPair: BLSKeyPair | null;
  generateBLSKey: () => Promise<any>;
  registerBLSKeyForVault: (vaultId: number) => Promise<void>;
  signBLSApproval: (
    requestId: number,
    vaultId: number,
    documentId: number,
    beneficiary: string,
    encryptedBeneficiaryShare?: string
  ) => Promise<any>;
  submitBLSBatchApproval: (payload: any) => Promise<void>;
}

const READONLY_STORAGE_KEY = "hierkey-near-readonly-account";

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [walletType, setWalletType] = useState<"near" | null>(null);
  const [nearAccountId, setNearAccountId] = useState<string | null>(null);
  const [nearBalance, setNearBalance] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const ecosystem = "near" as const;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-ecosystem", "near");
    }
  }, []);

  const setEcosystem = useCallback((_eco: "near") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hierkey-ecosystem", "near");
      document.documentElement.setAttribute("data-ecosystem", "near");
    }
  }, []);

  const isTestEnv = import.meta.env.MODE === "test";

  const refreshBalance = useCallback(async (accId: string | null) => {
    if (!accId) {
      setNearBalance(null);
      return;
    }
    const bal = await nearService.getAccountBalance(accId);
    setNearBalance(bal);
  }, []);

  const connectNear = useCallback(async (walletId?: NearWalletOption) => {
    setIsConnecting(true);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(READONLY_STORAGE_KEY);
      }
      setIsReadOnly(false);
      await nearService.connectWallet(walletId);
      setIsConnectModalOpen(false);
    } catch (err: any) {
      console.error("NEAR Wallet connection error:", err);
      toast.error(err?.message || "Failed to connect NEAR Wallet");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const connectNearReadOnly = useCallback(async (rawId: string) => {
    const trimmed = rawId.trim().toLowerCase();
    if (!isValidNearAddress(trimmed)) {
      throw new Error("Please enter a valid NEAR account ID (e.g. alice.testnet)");
    }
    setIsConnecting(true);
    try {
      nearService.setAccountId(trimmed);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(READONLY_STORAGE_KEY, trimmed);
      }
      setNearAccountId(trimmed);
      setAccount(trimmed);
      setWalletType("near");
      setIsReadOnly(true);
      await refreshBalance(trimmed);
      setIsConnectModalOpen(false);
      toast.success(`Previewing NEAR account ${trimmed} (Read-Only)`);
    } finally {
      setIsConnecting(false);
    }
  }, [refreshBalance]);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    if (!isTestEnv) {
      nearService.initWalletSelector().then(({ selector }) => {
        if (!mounted) return;
        const currentAcc = nearService.getAccountId();
        if (currentAcc) {
          setNearAccountId(currentAcc);
          setAccount(currentAcc);
          setWalletType("near");
          setIsReadOnly(false);
          void refreshBalance(currentAcc);
        } else if (typeof window !== "undefined") {
          const savedReadOnly = window.localStorage.getItem(READONLY_STORAGE_KEY);
          if (savedReadOnly && isValidNearAddress(savedReadOnly)) {
            nearService.setAccountId(savedReadOnly);
            setNearAccountId(savedReadOnly);
            setAccount(savedReadOnly);
            setWalletType("near");
            setIsReadOnly(true);
            void refreshBalance(savedReadOnly);
          }
        }

        subscription = selector.store.observable.subscribe((state) => {
          if (!mounted) return;
          const active = state.accounts.find((a) => a.active) || state.accounts[0];
          if (active) {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(READONLY_STORAGE_KEY);
            }
            setIsReadOnly(false);
            setNearAccountId(active.accountId);
            setAccount(active.accountId);
            setWalletType("near");
            void refreshBalance(active.accountId);
          } else {
            const savedReadOnly =
              typeof window !== "undefined" ? window.localStorage.getItem(READONLY_STORAGE_KEY) : null;
            if (savedReadOnly && isValidNearAddress(savedReadOnly)) {
              nearService.setAccountId(savedReadOnly);
              setNearAccountId(savedReadOnly);
              setAccount(savedReadOnly);
              setWalletType("near");
              setIsReadOnly(true);
              void refreshBalance(savedReadOnly);
            } else {
              setNearAccountId(null);
              setAccount(null);
              setWalletType(null);
              setNearBalance(null);
            }
          }
        });
      }).catch((err) => {
        console.warn("Passive NEAR wallet init skipped/failed:", err);
      });
    }

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [isTestEnv, refreshBalance]);

  const openConnectModal = useCallback(() => setIsConnectModalOpen(true), []);
  const closeConnectModal = useCallback(() => setIsConnectModalOpen(false), []);

  const connect = async () => {
    setIsConnectModalOpen(true);
  };

  const disconnect = useCallback((options?: { notify?: boolean }) => {
    if (isDisconnecting) return;
    const notify = options?.notify ?? true;
    setIsDisconnecting(true);

    if (walletType === "near") {
      void nearService.signOut();
    }

    setNearAccountId(null);
    setAccount(null);
    setWalletType(null);
    setNearBalance(null);
    setIsReadOnly(false);
    contractService.clear();

    if (notify) {
      toast.success("NEAR wallet disconnected");
    }
    window.setTimeout(() => setIsDisconnecting(false), 200);
  }, [isDisconnecting, walletType]);

  const switchToFuji = async () => {
    toast("Hierkey is 100% native on NEAR Protocol.");
  };

  const generateBLSKey = async (): Promise<any> => {
    toast("BLS aggregation is not required on NEAR.");
    return null;
  };

  const registerBLSKeyForVault = async (_vaultId: number): Promise<void> => {};
  const signBLSApproval = async (): Promise<any> => ({});
  const submitBLSBatchApproval = async (): Promise<void> => {};

  const value = {
    provider: null,
    signer: null,
    account,
    chainId: null,
    isConnected: !!account,
    isConnecting,
    contract: null,
    connect,
    disconnect,
    openConnectModal,
    closeConnectModal,
    isConnectModalOpen,
    walletType,
    switchToFuji,
    isFujiNetwork: true,
    isStellarNetwork: false,
    isNearNetwork: true,
    ecosystem,
    setEcosystem,
    stellarNetwork: "NEAR TESTNET",
    nearAccountId,
    nearBalance,
    isReadOnly,
    connectNear,
    connectNearReadOnly,
    blsKeyPair: null,
    generateBLSKey,
    registerBLSKeyForVault,
    signBLSApproval,
    submitBLSBatchApproval,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
      <ConnectWalletModal isOpen={isConnectModalOpen} onClose={closeConnectModal} />
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};
