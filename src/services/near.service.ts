import * as nearAPI from "near-api-js";
import type { WalletSelector, Wallet } from "@near-wallet-selector/core";
import { setupWalletSelector, actionCreators } from "@near-wallet-selector/core";
import { setupModal, type WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";

export interface NearVaultView {
  id: string;
  owner: string;
  name: string;
  description: string;
  heartbeat_interval_sec: string;
  last_proof_of_life_sec: string;
  guardians: string[];
  guardian_threshold: number;
  beneficiaries: string[];
  authorized_keeper: string | null;
  is_active: boolean;
  created_at_sec: string;
  metadata_cid: string;
  is_unlocked: boolean;
  remaining_time_sec: string;
  guardian_approvals_count: number;
}

export interface NearClaimRecord {
  beneficiary: string;
  claimed_at_ns: number;
}

const DEFAULT_CONTRACT_ID = "hierkey-363594.testnet";
const DEFAULT_NETWORK_ID = "testnet";
const DEFAULT_NODE_URL = "https://rpc.testnet.near.org";

export class NearService {
  public contractId: string;
  public networkId: string;
  public nodeUrl: string;
  public provider: any = null;
  private selector: WalletSelector | null = null;
  private modal: WalletSelectorModal | null = null;
  private wallet: Wallet | null = null;
  private accountId: string | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.contractId =
      (import.meta.env.VITE_NEAR_CONTRACT_ID as string) ||
      (import.meta.env.VITE_CONTRACT_ADDRESS as string) ||
      DEFAULT_CONTRACT_ID;
    this.networkId =
      (import.meta.env.VITE_NEAR_NETWORK_ID as string) || DEFAULT_NETWORK_ID;
    this.nodeUrl = (import.meta.env.VITE_NEAR_NODE_URL as string) || DEFAULT_NODE_URL;

    try {
      this.provider = new nearAPI.providers.JsonRpcProvider({
        url: this.nodeUrl,
      });
    } catch {
      this.provider = null;
    }
  }

  public async initWalletSelector(): Promise<{
    selector: WalletSelector;
    modal: WalletSelectorModal;
  }> {
    if (this.selector && this.modal) {
      return { selector: this.selector, modal: this.modal };
    }

    if (!this.initPromise) {
      this.initPromise = (async () => {
        const selector = await setupWalletSelector({
          network: this.networkId as "testnet" | "mainnet",
          modules: [
            setupMeteorWallet(),
            setupHereWallet(),
          ],
        });

        const modal = setupModal(selector, {
          contractId: this.contractId,
          description: "Connect your NEAR wallet to Hierkey",
        });

        const state = selector.store.getState();
        if (state.accounts.length > 0) {
          const selectedAccount =
            state.accounts.find((acc) => acc.active) || state.accounts[0];
          this.accountId = selectedAccount.accountId;
          this.wallet = await selector.wallet();
        }

        selector.store.observable.subscribe(async (nextState) => {
          if (nextState.accounts.length > 0) {
            const activeAcc =
              nextState.accounts.find((acc) => acc.active) ||
              nextState.accounts[0];
            this.accountId = activeAcc.accountId;
            this.wallet = await selector.wallet();
          } else {
            const savedReadOnly =
              typeof window !== "undefined"
                ? window.localStorage.getItem("hierkey-near-readonly-account")
                : null;
            if (savedReadOnly) {
              this.accountId = savedReadOnly;
            } else {
              this.accountId = null;
              this.wallet = null;
            }
          }
        });

        this.selector = selector;
        this.modal = modal;
      })();
    }

    await this.initPromise;
    return { selector: this.selector!, modal: this.modal! };
  }

  public getAccountId(): string | null {
    if (this.accountId) return this.accountId;
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("hierkey-near-readonly-account");
      if (saved) return saved;
    }
    return null;
  }

  public setAccountId(accountId: string | null) {
    this.accountId = accountId;
  }

  public async getWallet(): Promise<Wallet | null> {
    if (!this.wallet && this.selector) {
      try {
        this.wallet = await this.selector.wallet();
      } catch {
        // no wallet selected yet
      }
    }
    return this.wallet;
  }

  public async showModal() {
    const { modal } = await this.initWalletSelector();
    modal.show();
  }

  public async connectWallet(
    walletId?: "my-near-wallet" | "meteor-wallet" | "here-wallet"
  ): Promise<void> {
    const { selector, modal } = await this.initWalletSelector();
    if (!walletId) {
      modal.show();
      return;
    }

    try {
      const wallet = await selector.wallet(walletId);
      if (typeof (wallet as any).signIn === "function") {
        await (wallet as any).signIn({
          contractId: this.contractId,
          methodNames: ["create_vault", "prove_life", "approve_emergency_release", "claim_vault"],
        });
      } else {
        modal.show();
      }
    } catch (err) {
      console.warn(`Direct sign-in for ${walletId} fell back to modal:`, err);
      modal.show();
    }
  }

  public async getAccountBalance(accountId?: string | null): Promise<string | null> {
    const target = accountId || this.accountId;
    if (!target) return null;
    try {
      const res = await fetch(this.nodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "bal",
          method: "query",
          params: {
            request_type: "view_account",
            finality: "final",
            account_id: target,
          },
        }),
      });
      const json = await res.json();
      if (json?.result?.amount) {
        return nearAPI.utils.format.formatNearAmount(json.result.amount, 2);
      }
      return "0";
    } catch {
      return null;
    }
  }

  public async signOut() {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem("hierkey-near-readonly-account");
      } catch {}
    }
    if (this.wallet) {
      try {
        await this.wallet.signOut();
      } catch {}
      this.wallet = null;
    }
    this.accountId = null;
  }

  // --- VIEW CALLS ---

  public async viewMethod<T>(methodName: string, args: Record<string, unknown> = {}): Promise<T> {
    try {
      const jsonStr = JSON.stringify(args);
      const argsBase64 =
        typeof window !== "undefined"
          ? btoa(unescape(encodeURIComponent(jsonStr)))
          : Buffer.from(jsonStr).toString("base64");

      const res = await fetch(this.nodeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: "view",
          method: "query",
          params: {
            request_type: "call_function",
            account_id: this.contractId,
            method_name: methodName,
            args_base64: argsBase64,
            finality: "optimistic",
          },
        }),
      });
      const json = await res.json();
      if (json?.error) {
        throw new Error(json.error?.data || json.error?.message || "NEAR RPC view error");
      }
      const bytes = new Uint8Array(json.result.result);
      const decoded = new TextDecoder().decode(bytes);
      return JSON.parse(decoded) as T;
    } catch (error) {
      console.warn(`NEAR view call [${methodName}] failed:`, error);
      throw error;
    }
  }

  public async getVault(vaultId: number | string): Promise<NearVaultView | null> {
    try {
      return await this.viewMethod<NearVaultView | null>("get_vault", {
        vault_id: String(vaultId),
      });
    } catch {
      return null;
    }
  }

  public async getVaultsByOwner(owner: string): Promise<NearVaultView[]> {
    try {
      return await this.viewMethod<NearVaultView[]>("get_vaults_by_owner", {
        owner,
      });
    } catch {
      return [];
    }
  }

  public async getVaultsByBeneficiary(beneficiary: string): Promise<NearVaultView[]> {
    try {
      return await this.viewMethod<NearVaultView[]>("get_vaults_by_beneficiary", {
        beneficiary,
      });
    } catch {
      return [];
    }
  }

  public async getVaultsByGuardian(guardian: string): Promise<NearVaultView[]> {
    try {
      return await this.viewMethod<NearVaultView[]>("get_vaults_by_guardian", {
        guardian,
      });
    } catch {
      return [];
    }
  }

  public async isVaultUnlocked(vaultId: number | string): Promise<boolean> {
    try {
      return await this.viewMethod<boolean>("is_vault_unlocked", {
        vault_id: String(vaultId),
      });
    } catch {
      return false;
    }
  }

  public async getClaims(vaultId: number | string): Promise<NearClaimRecord[]> {
    try {
      return await this.viewMethod<NearClaimRecord[]>("get_claims", {
        vault_id: String(vaultId),
      });
    } catch {
      return [];
    }
  }

  public async getGuardianApprovals(vaultId: number | string): Promise<string[]> {
    try {
      return await this.viewMethod<string[]>("get_guardian_approvals", {
        vault_id: String(vaultId),
      });
    } catch {
      return [];
    }
  }

  public async getTotalVaults(): Promise<number> {
    try {
      const res = await this.viewMethod<string>("get_total_vaults");
      return Number(res) || 0;
    } catch {
      return 0;
    }
  }

  // --- WRITE CALLS ---

  public async callMethod(
    methodName: string,
    args: Record<string, unknown> = {},
    gas = "30000000000000",
    deposit = "0"
  ): Promise<any> {
    const wallet = await this.getWallet();
    if (!wallet) {
      throw new Error("NEAR wallet not connected. Please connect your wallet first.");
    }

    return await wallet.signAndSendTransaction({
      receiverId: this.contractId,
      actions: [
        actionCreators.functionCall(
          methodName,
          args,
          BigInt(gas),
          BigInt(deposit)
        ),
      ],
    });
  }

  public async createVault(params: {
    name: string;
    description: string;
    heartbeatIntervalSec: number;
    guardians: string[];
    guardianThreshold: number;
    beneficiaries: string[];
    authorizedKeeper?: string | null;
    metadataCid: string;
  }): Promise<string> {
    const result = await this.callMethod("create_vault", {
      name: params.name,
      description: params.description,
      heartbeat_interval_sec: String(params.heartbeatIntervalSec),
      guardians: params.guardians,
      guardian_threshold: params.guardianThreshold,
      beneficiaries: params.beneficiaries,
      authorized_keeper: params.authorizedKeeper || null,
      metadata_cid: params.metadataCid,
    });
    return String(result?.transaction?.hash || result || "");
  }

  public async proveLife(vaultId: number | string): Promise<void> {
    await this.callMethod("prove_life", {
      vault_id: String(vaultId),
    });
  }

  public async approveEmergencyRelease(vaultId: number | string): Promise<void> {
    await this.callMethod("approve_emergency_release", {
      vault_id: String(vaultId),
    });
  }

  public async claimVault(vaultId: number | string): Promise<void> {
    await this.callMethod("claim_vault", {
      vault_id: String(vaultId),
    });
  }

  public async addGuardian(vaultId: number | string, guardian: string): Promise<void> {
    await this.callMethod("add_guardian", {
      vault_id: String(vaultId),
      guardian,
    });
  }

  public async addBeneficiary(vaultId: number | string, beneficiary: string): Promise<void> {
    await this.callMethod("add_beneficiary", {
      vault_id: String(vaultId),
      beneficiary,
    });
  }

  public async authorizeKeeper(
    vaultId: number | string,
    keeper: string | null
  ): Promise<void> {
    await this.callMethod("authorize_keeper", {
      vault_id: String(vaultId),
      keeper,
    });
  }

  public async terminateVault(vaultId: number | string): Promise<void> {
    await this.callMethod("terminate_vault", {
      vault_id: String(vaultId),
    });
  }
}

export const nearService = new NearService();

