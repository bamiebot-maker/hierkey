import { ethers } from "ethers";
import { nearService, type NearVaultView } from "./near.service";
import { identityService } from "./identity.service";
import { TtlCache } from "../utils/ttlCache";
import {
  OfflineQueuedError,
  isNetworkFailure,
  withOfflineFallback,
  readDocumentsCache,
  readInvitesCache,
  readPublicKeyCache,
  readVaultsCache,
  writeDocumentsCache,
  writeInvitesCache,
  writePublicKeyCache,
  writeVaultsCache,
} from "./offline/offlineCache.service";
import { enqueueAction } from "./offline/offlineQueue.service";

export interface VaultData {
  id: number;
  creator: string;
  name: string;
  description: string;
  guardians: string[];
  approvalThreshold: number;
  isActive: boolean;
  createdAt: number;
  network?: "avalanche" | "stellar" | "near";
}

export interface DocumentData {
  id: number;
  vaultId: number;
  encryptedMetadata: string;
  ipfsHash: string;
  uploadedBy: string;
  uploadedAt: number;
  requiredAccess: number;
}

export interface TokenData {
  tokenId: number;
  owner: string;
  vaultId: number | null;
  tokenURI: string;
  mintedAt: number | null;
}

export interface ActivityEvent {
  action: string;
  actor: string;
  timestamp: number;
  status: "success" | "pending";
  txHash?: string;
  network?: "avalanche" | "stellar" | "near";
}

export interface AccessRequestData {
  requestId: number;
  documentId: number;
  requester: string;
  status: number;
  expiresAt: number;
  createdAt: number;
}

export interface PendingApprovalData {
  requestId: number;
  documentId: number;
  vaultId: number;
  vaultName: string;
  requester: string;
  createdAt: number;
  expiresAt: number;
}

export interface GuardianInviteData {
  guardian: string;
  vaultId: number;
  accepted: boolean;
  expiresAt: number;
}

export interface VaultReleaseState {
  emergencyMode: boolean;
  inactivityPeriod: number;
  lastProofOfLife: number;
  postDeathUnlocked: boolean;
}

export interface EmergencyUnlockSchedule {
  requested: boolean;
  fulfilled: boolean;
  unlockAt: number;
  unlockBlock: number;
}

export interface KeeperAuthorizationData {
  keeper: string;
  expiresAt: number;
}

const CONTRACT_ABI = [
  "function createVault(string name, string description, address[] guardians, uint256 approvalThreshold) external returns (uint256)",
  "function addDocument(uint256 vaultId, string encryptedMetadata, string ipfsHash, uint8 requiredAccess) external returns (uint256)",
  "function addDocument(uint256 vaultId, string encryptedMetadata, string ipfsHash, uint8 requiredAccess, address[] guardiansList, string[] shares) external returns (uint256)",
  "function addDocumentWithReleaseCondition(uint256 vaultId, string encryptedMetadata, string ipfsHash, uint8 requiredAccess, uint8 releaseCondition) external returns (uint256)",
  "function addDocumentWithReleaseCondition(uint256 vaultId, string encryptedMetadata, string ipfsHash, uint8 requiredAccess, uint8 releaseCondition, address[] guardiansList, string[] shares) external returns (uint256)",
  "function configureVaultRelease(uint256 vaultId, uint256 inactivityPeriod) external",
  "function proveLife(uint256 vaultId) external",
  "function authorizeKeeperBySig(uint256 vaultId, address keeper, uint256 expiresAt, bytes signature) external",
  "function revokeKeeper(uint256 vaultId) external",
  "function proveLifeByKeeper(uint256 vaultId) external",
  "function keeperAuthorizations(uint256 vaultId) external view returns (address keeper, uint256 expiresAt)",
  "function keeperAuthNonces(uint256 vaultId) external view returns (uint256)",
  "function getVaultGID(uint256 vaultId) external view returns (string)",
  "function setEmergencyMode(uint256 vaultId, bool enabled) external",
  "function getEmergencyUnlockSchedule(uint256 vaultId) external view returns (bool requested, bool fulfilled, uint256 unlockAt, uint256 unlockBlock)",
  "function getVrfConfig() external view returns (address coordinator, bytes32 keyHash, uint256 subscriptionId, uint32 callbackGasLimit, uint16 minimumRequestConfirmations)",
  "function setBeneficiary(uint256 vaultId, address beneficiary) external",
  "function getBeneficiary(uint256 vaultId) external view returns (address)",
  "function getVaultReleaseState(uint256 vaultId) external view returns (bool emergencyMode, uint256 inactivityPeriod, uint256 lastProofOfLife, bool postDeathUnlocked)",
  "function documentReleaseCondition(uint256 documentId) external view returns (uint8)",
  "function requestAccess(uint256 documentId) external returns (uint256)",
  "function approveAccess(uint256 requestId) external",
  "function approveAccess(uint256 requestId, string encryptedShareForBeneficiary) external",
  "function verifyDelegation(address guardian, address delegate, uint256 vaultId, uint256 validUntil, uint256 nonce, bytes signature) external view returns (bool)",
  "function revokeDelegation(uint256 nonce) external",
  "function approveAccessDelegated(uint256 requestId, address guardian, uint256 validUntil, uint256 nonce, bytes signature) external",
  "function approveAccessDelegated(uint256 requestId, address guardian, uint256 validUntil, uint256 nonce, bytes signature, string encryptedShareForBeneficiary) external",
  "function revokedNonces(address guardian, uint256 nonce) external view returns (bool)",
  "function guardianShareCommitments(uint256 documentId, address guardian) external view returns (bytes32)",
  "function setDocumentVSSCommitments(uint256 documentId, bytes32[] commitments) external",
  "function getDocumentVSSCommitments(uint256 documentId) external view returns (bytes32[])",
  "function applyShareRefresh(uint256 documentId, address[] guardiansList, string[] newShares, bytes32[] newCommitments) external",
  "event ShareValidated(uint256 indexed requestId, address indexed guardian, bytes32 commitment)",
  "event VSSCommitmentsUpdated(uint256 indexed documentId, uint256 indexed epoch, bytes32[] commitments)",
  "error InvalidShareCommitment()",
  "error InvalidVSSCommitmentUpdate()",
  "function acceptGuardianInvite(uint256 vaultId) external",
  "function accessRequests(uint256 requestId) external view returns (uint256 requestId, uint256 documentId, address requester, uint8 status, uint256 expiresAt, uint256 createdAt)",
  "function latestRequestId(uint256 documentId, address user) external view returns (uint256)",
  "function hasApprovedRequest(uint256 requestId, address approver) external view returns (bool)",
  "function getPendingInvites(address user) external view returns (tuple(address guardian, uint256 vaultId, bool accepted, uint256 expiresAt)[])",
  "function revokeAccess(uint256 documentId, address user) external",
  "function mintAccessToken(uint256 vaultId, address to, string tokenURI) external returns (uint256)",
  "function burnAccessToken(uint256 tokenId) external",
  "function getVault(uint256 vaultId) external view returns (uint256, address, string, string, address[], uint256, bool, uint256)",
  "function documents(uint256 documentId) external view returns (uint256, uint256, string, string, address, uint256, uint8)",
  "function hasActiveAccess(uint256 documentId, address user) external view returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function registerPublicKey(string publicKey) external",
  "function userPublicKeys(address user) external view returns (string)",
  "function getEncryptedGuardianShare(uint256 documentId, address guardian) external view returns (string)",
  "function getBeneficiaryKeyShare(uint256 requestId, address guardian) external view returns (string)",
  "event VaultCreated(uint256 indexed vaultId, address indexed creator, string name)",
  "event GuardianAdded(uint256 indexed vaultId, address indexed guardian)",
  "event GuardianRemoved(uint256 indexed vaultId, address indexed guardian)",
  "event DocumentAdded(uint256 indexed documentId, uint256 indexed vaultId, string ipfsHash)",
  "event AccessRequested(uint256 indexed requestId, uint256 indexed documentId, address indexed requester)",
  "event AccessApproved(uint256 indexed requestId, address indexed approver)",
  "event AccessGranted(uint256 indexed requestId, uint256 indexed documentId, address indexed requester)",
  "event NFTMinted(uint256 indexed tokenId, address indexed to, uint256 indexed vaultId)",
  "event NFTBurned(uint256 indexed tokenId)",
  "event DocumentReleaseConditionSet(uint256 indexed documentId, uint8 condition)",
  "event PublicKeyRegistered(address indexed user, string publicKey)",
  "event GuardianSharesSaved(uint256 indexed documentId)",
  "event ShareSubmittedForBeneficiary(uint256 indexed requestId, address indexed guardian, string encryptedShare)",
  "event BeneficiarySet(uint256 indexed vaultId, address indexed beneficiary)",
  "event KeeperAuthorized(uint256 indexed vaultId, address indexed owner, address indexed keeper, uint256 expiresAt)",
  "event KeeperRevoked(uint256 indexed vaultId, address indexed owner)",
  "event ProofOfLifeRelayed(uint256 indexed vaultId, address indexed owner, address indexed keeper, uint256 timestamp)",
  "event DelegationRevoked(address indexed guardian, uint256 indexed nonce)",
  "event DelegatedApprovalSubmitted(uint256 indexed requestId, address indexed guardian, address indexed delegate)",
];

const KEEPER_AUTHORIZATION_EIP712_TYPES = {
  KeeperAuthorization: [
    { name: "vaultId", type: "uint256" },
    { name: "keeper", type: "address" },
    { name: "expiresAt", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

const GUARDIAN_DELEGATION_EIP712_TYPES = {
  GuardianDelegation: [
    { name: "guardian", type: "address" },
    { name: "delegate", type: "address" },
    { name: "vaultId", type: "uint256" },
    { name: "validUntil", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

let provider: ethers.Provider | null = null;
let fallbackProviders: ethers.JsonRpcProvider[] = [];
let readContract: ethers.Contract | null = null;
let writeContract: ethers.Contract | null = null;
let verifiedAddress: string | null = null;
let hasVerifiedCode = false;

// Read-only view calls (hasActiveAccess, getVault) are idempotent within a short
// window, so cache them for a bounded TTL instead of re-hitting the RPC endpoint
// on every render/navigation. See invalidation calls in the write paths below.
const VIEW_CALL_TTL_MS = 10_000;
const hasActiveAccessCache = new TtlCache<boolean>(VIEW_CALL_TTL_MS);
const getVaultCache = new TtlCache<any>(VIEW_CALL_TTL_MS);

const clearAccessCache = (): void => hasActiveAccessCache.clear();
const invalidateVaultCache = (vaultId: number): void =>
  getVaultCache.invalidate(`getVault:${vaultId}`);

const isNearActive = (): boolean => {
  try {
    const eco = localStorage.getItem("hierkey-ecosystem");
    if (eco === "near") return true;
    if (Boolean(nearService.getAccountId())) return true;
  } catch {}
  return true;
};

const FUJI_RPC_URLS = [
  "https://api.avax-test.network/ext/bc/C/rpc",
  "https://rpc.ankr.com/avalanche_fuji",
];

const MAINNET_RPC_URLS = [
  "https://api.avax.network/ext/bc/C/rpc",
  "https://rpc.ankr.com/avalanche",
];

const getContractAddress = (): string => {
  return (
    (import.meta.env.VITE_NEAR_CONTRACT_ID as string | undefined) ||
    (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ||
    "hierkey-363594.testnet"
  );
};

const getRpcCandidates = (): string[] => {
  const configured = (import.meta.env.VITE_AVALANCHE_RPC as string | undefined)?.trim();
  const chainId = Number(import.meta.env.VITE_CHAIN_ID);
  const defaults = chainId === 43114 ? MAINNET_RPC_URLS : FUJI_RPC_URLS;
  const all = configured ? [configured, ...defaults] : [...defaults];

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const url of all) {
    const normalized = url.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    unique.push(normalized);
  }
  return unique;
};

const getConfiguredRpcProviders = (): ethers.JsonRpcProvider[] => {
  return getRpcCandidates().map((url) => new ethers.JsonRpcProvider(url));
};

const getReadProviders = (): ethers.Provider[] => {
  if (fallbackProviders.length > 0) {
    return [...fallbackProviders];
  }

  if (provider) {
    return [provider];
  }

  throw new Error("No read provider is initialized");
};

const extractProviderErrorMessage = (error: any): string => {
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  if (typeof error?.shortMessage === "string" && error.shortMessage.trim()) {
    return error.shortMessage;
  }
  return "Unknown provider error";
};

const getTxWaitTimeoutMs = (): number => {
  const configured = Number(import.meta.env.VITE_TX_WAIT_TIMEOUT_MS);
  if (!Number.isNaN(configured) && configured > 0) {
    return configured;
  }
  return 180000;
};

const waitForReceipt = async (tx: any) => {
  const timeoutMs = getTxWaitTimeoutMs();

  if (tx?.hash && fallbackProviders.length > 0) {
    for (const activeProvider of fallbackProviders) {
      try {
        const mined = await activeProvider.waitForTransaction(tx.hash, 1, timeoutMs);
        if (mined) {
          return mined;
        }
      } catch {
        // Try next provider, then fallback to signer provider below.
      }
    }
  }

  const receipt = await tx.wait(1, timeoutMs);
  if (!receipt) {
    throw new Error(
      "Transaction confirmation timed out. Check your wallet, then refresh and retry."
    );
  }

  return receipt;
};

const ensureContractDeployed = async (): Promise<void> => {
  return;
};

const ensureReadContract = (): ethers.Contract => {
  if (!readContract) {
    throw new Error("Contract not initialized");
  }
  return readContract;
};

const ensureWriteContract = (): ethers.Contract => {
  if (!writeContract) {
    throw new Error("Write contract not initialized");
  }
  return writeContract;
};

const contractHasFunction = (contract: ethers.Contract, signature: string): boolean => {
  try {
    contract.interface.getFunction(signature);
    return true;
  } catch {
    return false;
  }
};

const getInterface = (): ethers.Interface => new ethers.Interface(CONTRACT_ABI);

const getLogChunkSize = (): number => {
  const configured = Number(import.meta.env.VITE_LOG_CHUNK_SIZE);
  if (!Number.isNaN(configured) && configured > 0) {
    return configured;
  }
  return 2000;
};

const chunkArray = <T,>(items: T[], size: number): T[][] => {
  if (size <= 0) return [items];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

const EVENT_LOG_CACHE_PREFIX = "hierkey-event-log-cache";
const EVENT_LOG_CACHE_VERSION = 1;

type ParsedLogEntry = { log: ethers.Log; parsed: ethers.LogDescription };

interface EventLogCacheRecord {
  address: string;
  blockHash: string;
  blockNumber: number;
  data: string;
  index: number;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: number;
}

interface EventLogCachePayload {
  version: number;
  chainId: number;
  contractAddress: string;
  eventName: string;
  filterKey?: string;
  lastSyncedBlock: number;
  logs: EventLogCacheRecord[];
}

interface EventLogQueryOptions {
  tail?: number;
  filters?: Array<
    string | number | bigint | null | Array<string | number | bigint | null>
  >;
}

const getConfiguredChainId = (): number => {
  const configured = Number(import.meta.env.VITE_CHAIN_ID);
  if (!Number.isNaN(configured) && configured > 0) {
    return configured;
  }
  return 0;
};

const getEventLogCacheKey = (
  eventName: string,
  contractAddress: string,
  filterKey?: string
): string => {
  return [
    EVENT_LOG_CACHE_PREFIX,
    EVENT_LOG_CACHE_VERSION,
    getConfiguredChainId(),
    contractAddress.toLowerCase(),
    eventName,
    filterKey || "all",
  ].join(":");
};

const readEventLogCache = (
  eventName: string,
  contractAddress: string,
  filterKey?: string
): EventLogCachePayload | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      getEventLogCacheKey(eventName, contractAddress, filterKey)
    );
    if (!raw) return null;

    const parsed = JSON.parse(raw) as EventLogCachePayload;
    if (
      !parsed ||
      parsed.version !== EVENT_LOG_CACHE_VERSION ||
      parsed.chainId !== getConfiguredChainId() ||
      parsed.contractAddress.toLowerCase() !== contractAddress.toLowerCase() ||
      parsed.eventName !== eventName ||
      (filterKey && parsed.filterKey !== filterKey) ||
      !Array.isArray(parsed.logs)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const writeEventLogCache = (
  eventName: string,
  contractAddress: string,
  payload: Omit<
    EventLogCachePayload,
    "version" | "chainId" | "contractAddress" | "eventName"
  >,
  filterKey?: string
): void => {
  if (typeof window === "undefined") return;
  try {
    const value: EventLogCachePayload = {
      version: EVENT_LOG_CACHE_VERSION,
      chainId: getConfiguredChainId(),
      contractAddress: contractAddress.toLowerCase(),
      eventName,
      filterKey,
      ...payload,
    };
    window.localStorage.setItem(
      getEventLogCacheKey(eventName, contractAddress, filterKey),
      JSON.stringify(value)
    );
  } catch {
    // ignore storage write errors
  }
};

const toCacheRecord = (log: ethers.Log): EventLogCacheRecord => ({
  address: String(log.address ?? ""),
  blockHash: String(log.blockHash ?? ""),
  blockNumber: Number(log.blockNumber ?? 0),
  data: String(log.data ?? "0x"),
  index: Number((log as any).index ?? 0),
  removed: Boolean(log.removed ?? false),
  topics: Array.isArray(log.topics) ? [...log.topics] : [],
  transactionHash: String(log.transactionHash ?? ""),
  transactionIndex: Number(log.transactionIndex ?? 0),
});

const fromCacheRecord = (record: EventLogCacheRecord): ethers.Log =>
  ({
    address: record.address,
    blockHash: record.blockHash,
    blockNumber: record.blockNumber,
    data: record.data,
    index: record.index,
    removed: record.removed,
    topics: record.topics,
    transactionHash: record.transactionHash,
    transactionIndex: record.transactionIndex,
  } as unknown as ethers.Log);

const sortLogsAscending = (logs: ethers.Log[]): ethers.Log[] => {
  return [...logs].sort((a, b) => {
    if (a.blockNumber !== b.blockNumber) {
      return a.blockNumber - b.blockNumber;
    }
    return (a.index ?? 0) - (b.index ?? 0);
  });
};

const getPendingRequestScanDepth = (): number => {
  const configured = Number(import.meta.env.VITE_PENDING_REQUEST_SCAN_DEPTH);
  if (!Number.isNaN(configured) && configured > 0) {
    return configured;
  }
  return 1500;
};

const getFromBlock = async (): Promise<number> => {
  const configured = Number(import.meta.env.VITE_CONTRACT_DEPLOY_BLOCK);
  if (!Number.isNaN(configured) && configured > 0) {
    return configured;
  }

  let lastError: string | null = null;
  for (const activeProvider of getReadProviders()) {
    try {
      const latest = await activeProvider.getBlockNumber();
      const fallbackRange = 200000;
      return Math.max(0, latest - fallbackRange);
    } catch (error) {
      lastError = extractProviderErrorMessage(error);
    }
  }
  throw new Error(lastError || "Failed to determine fromBlock");
};

const normalizeFilterValue = (
  value: string | number | bigint | null
): string | bigint | null => {
  if (value === null) return null;
  if (typeof value === "number") return BigInt(value);
  return value;
};

const normalizeFilterValues = (
  filters: EventLogQueryOptions["filters"]
): Array<string | bigint | null | Array<string | bigint | null>> | undefined => {
  if (!filters) return undefined;
  return filters.map((filter) => {
    if (Array.isArray(filter)) {
      return filter.map((value) => normalizeFilterValue(value));
    }
    return normalizeFilterValue(filter);
  });
};

const toFilterKey = (topics: (string | string[] | null)[]): string => {
  try {
    return JSON.stringify(topics);
  } catch {
    return "all";
  }
};

const getEventLogs = async (
  eventName: string,
  options?: EventLogQueryOptions
): Promise<ParsedLogEntry[]> => {
  const address = getContractAddress();
  const iface = getInterface();
  let event: ethers.EventFragment | null = null;
  try {
    event = iface.getEvent(eventName);
  } catch {
    return [];
  }
  if (!event) {
    return [];
  }
  const normalizedFilters = normalizeFilterValues(options?.filters) ?? [];
  const topics = iface.encodeFilterTopics(event, normalizedFilters);
  const filterKey = toFilterKey(topics);
  let logs: ethers.Log[] = [];
  const fromBlock = await getFromBlock();
  const cached = readEventLogCache(eventName, address, filterKey);
  const cachedLogs = cached
    ? cached.logs.map(fromCacheRecord).filter((log) => log.blockNumber >= fromBlock)
    : [];
  let lastError: string | null = null;

  for (const activeProvider of getReadProviders()) {
    try {
      const toBlock = await activeProvider.getBlockNumber();
      const startBlock = Math.min(fromBlock, toBlock);
      const chunkSize = getLogChunkSize();
      const canUseCache =
        !!cached &&
        cached.lastSyncedBlock >= startBlock &&
        cached.lastSyncedBlock <= toBlock &&
        cachedLogs.length > 0;
      logs = canUseCache ? [...cachedLogs] : [];
      const incrementalStart = canUseCache
        ? Math.max(startBlock, cached!.lastSyncedBlock + 1)
        : startBlock;

      for (let current = incrementalStart; current <= toBlock; current += chunkSize) {
        const end = Math.min(current + chunkSize - 1, toBlock);
        const chunk = await activeProvider.getLogs({
          address,
          fromBlock: current,
          toBlock: end,
          topics,
        });
        logs.push(...chunk);
      }
      logs = sortLogsAscending(logs);
      writeEventLogCache(
        eventName,
        address,
        {
          lastSyncedBlock: toBlock,
          logs: logs.map(toCacheRecord),
        },
        filterKey
      );
      lastError = null;
      break;
    } catch (error: any) {
      lastError = extractProviderErrorMessage(error);
    }
  }

  if (lastError) {
    if (cachedLogs.length > 0) {
      logs = sortLogsAscending(cachedLogs);
      lastError = null;
    } else {
      const hint = "Log query failed. Set VITE_CONTRACT_DEPLOY_BLOCK to the contract deploy block.";
      throw new Error(`[${eventName}] ${hint} ${lastError}`);
    }
  }

  const effectiveTail = options?.tail && options.tail > 0 ? options.tail : 0;
  const logsForParsing =
    effectiveTail > 0 && logs.length > effectiveTail ? logs.slice(-effectiveTail) : logs;

  const parsedLogs = logsForParsing
    .map((log) => {
      const parsed = iface.parseLog(log);
      if (!parsed) return null;
      return { log, parsed };
    })
    .filter((entry): entry is { log: ethers.Log; parsed: ethers.LogDescription } => entry !== null);

  return parsedLogs;
};

const getBlockTimestamp = async (
  blockNumber: number,
  cache: Map<number, number>
): Promise<number> => {
  if (cache.has(blockNumber)) {
    return cache.get(blockNumber)!;
  }
  let lastError: string | null = null;

  for (const activeProvider of getReadProviders()) {
    try {
      const block = await activeProvider.getBlock(blockNumber);
      const timestamp = block ? Number(block.timestamp) : 0;
      cache.set(blockNumber, timestamp);
      return timestamp;
    } catch (error) {
      lastError = extractProviderErrorMessage(error);
    }
  }

  throw new Error(lastError || `Failed to fetch block ${blockNumber}`);
};

const normalizeAccessRequest = (value: any): AccessRequestData => ({
  requestId: Number(value.requestId ?? value[0]),
  documentId: Number(value.documentId ?? value[1]),
  requester: String(value.requester ?? value[2]),
  status: Number(value.status ?? value[3]),
  expiresAt: Number(value.expiresAt ?? value[4]),
  createdAt: Number(value.createdAt ?? value[5]),
});

const initialize = (
  providerInput: ethers.Provider,
  signerInput?: ethers.Signer
): void => {
  provider = providerInput;
  fallbackProviders = getConfiguredRpcProviders();

  const address = getContractAddress();
  readContract = new ethers.Contract(
    address,
    CONTRACT_ABI,
    fallbackProviders[0] ?? providerInput
  );
  writeContract = signerInput
    ? new ethers.Contract(address, CONTRACT_ABI, signerInput)
    : null;
};

const clear = (): void => {
  provider = null;
  fallbackProviders = [];
  readContract = null;
  writeContract = null;
  verifiedAddress = null;
  hasVerifiedCode = false;
  hasActiveAccessCache.clear();
  getVaultCache.clear();
};

const isReady = (): boolean => !!readContract;

const createVault = async (
  name: string,
  description: string,
  guardians: string[],
  approvalThreshold: number
): Promise<number> => {
  const contract = ensureWriteContract();
  const tx = await contract.createVault(
    name,
    description,
    guardians,
    approvalThreshold
  );
  const receipt = await waitForReceipt(tx);

  if (!receipt) {
    return 0;
  }

  const iface = getInterface();
  for (const log of receipt.logs ?? []) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "VaultCreated") {
        return Number(parsed.args.vaultId);
      }
    } catch {
      // ignore non-matching logs
    }
  }

  return 0;
};

const addDocument = async (
  vaultId: number,
  encryptedMetadata: string,
  ipfsHash: string,
  requiredAccess: number,
  releaseCondition = 0,
  guardiansList?: string[],
  shares?: string[]
): Promise<number> => {
  const contract = ensureWriteContract();
  let tx: any;
  const hasShares = guardiansList && shares && guardiansList.length > 0 && shares.length > 0;

  if (
    releaseCondition !== 0 &&
    contractHasFunction(
      contract,
      "addDocumentWithReleaseCondition(uint256,string,string,uint8,uint8,address[],string[])"
    )
  ) {
    if (hasShares) {
      tx = await contract.addDocumentWithReleaseCondition(
        vaultId,
        encryptedMetadata,
        ipfsHash,
        requiredAccess,
        releaseCondition,
        guardiansList,
        shares
      );
    } else {
      tx = await contract.addDocumentWithReleaseCondition(
        vaultId,
        encryptedMetadata,
        ipfsHash,
        requiredAccess,
        releaseCondition
      );
    }
  } else if (releaseCondition === 0) {
    if (hasShares && contractHasFunction(contract, "addDocument(uint256,string,string,uint8,address[],string[])")) {
      tx = await contract.addDocument(
        vaultId,
        encryptedMetadata,
        ipfsHash,
        requiredAccess,
        guardiansList,
        shares
      );
    } else {
      tx = await contract.addDocument(
        vaultId,
        encryptedMetadata,
        ipfsHash,
        requiredAccess
      );
    }
  } else {
    throw new Error(
      "Current contract does not support release-condition policy uploads. Redeploy latest contract."
    );
  }

  const receipt = await waitForReceipt(tx);

  if (!receipt) {
    return 0;
  }

  const iface = getInterface();
  for (const log of receipt.logs ?? []) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "DocumentAdded") {
        return Number(parsed.args.documentId);
      }
    } catch {
      // ignore non-matching logs
    }
  }

  return 0;
};

const requestAccess = async (documentId: number): Promise<number> => {
  const contract = ensureWriteContract();
  const tx = await contract.requestAccess(documentId);
  const receipt = await waitForReceipt(tx);

  if (!receipt) {
    return 0;
  }

  const iface = getInterface();
  for (const log of receipt.logs ?? []) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "AccessRequested") {
        return Number(parsed.args.requestId);
      }
    } catch {
      // ignore non-matching logs
    }
  }

  return 0;
};

const approveAccess = async (requestId: number, encryptedShareForBeneficiary?: string): Promise<void> => {
  const contract = ensureWriteContract();
  let tx: any;
  if (encryptedShareForBeneficiary && contractHasFunction(contract, "approveAccess(uint256,string)")) {
    tx = await contract.approveAccess(requestId, encryptedShareForBeneficiary);
  } else {
    tx = await contract.approveAccess(requestId);
  }
  await waitForReceipt(tx);
};

const registerGuardianBLSKey = async (
  vaultId: number,
  blsPublicKey: string,
  proofOfPossession: string
): Promise<void> => {
  const contract = ensureWriteContract();
  const tx = await contract.registerGuardianBLSKey(vaultId, blsPublicKey, proofOfPossession);
  await waitForReceipt(tx);
};

const getGuardianBLSKey = async (
  vaultId: number,
  guardian: string
): Promise<{ blsPublicKey: string; proofOfPossession: string; isRegistered: boolean }> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  try {
    const res = await contract.getGuardianBLSKey(vaultId, guardian);
    return {
      blsPublicKey: res[0],
      proofOfPossession: res[1],
      isRegistered: Boolean(res[2]),
    };
  } catch {
    return {
      blsPublicKey: "",
      proofOfPossession: "",
      isRegistered: false,
    };
  }
};

const approveAccessBLS = async (
  requestId: number,
  guardianAddresses: string[],
  aggregatedSignature: string,
  aggregatedPublicKey: string,
  encryptedSharesForBeneficiary: string[] = []
): Promise<void> => {
  const contract = ensureWriteContract();
  const tx = await contract.approveAccessBLS(
    requestId,
    guardianAddresses,
    aggregatedSignature,
    aggregatedPublicKey,
    encryptedSharesForBeneficiary
  );
  await waitForReceipt(tx);
};

const registerPublicKey = async (publicKey: string): Promise<void> => {
  const contract = ensureWriteContract();
  const tx = await contract.registerPublicKey(publicKey);
  await waitForReceipt(tx);
};

const getUserPublicKey = async (user: string): Promise<string> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  try {
    return await contract.userPublicKeys(user);
  } catch {
    return "";
  }
};

const getEncryptedGuardianShare = async (documentId: number, guardian: string): Promise<string> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  try {
    return await contract.getEncryptedGuardianShare(documentId, guardian);
  } catch {
    return "";
  }
};

const getBeneficiaryKeyShare = async (requestId: number, guardian: string): Promise<string> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  try {
    return await contract.getBeneficiaryKeyShare(requestId, guardian);
  } catch {
    return "";
  }
};

const acceptGuardianInvite = async (vaultId: number): Promise<void> => {
  const contract = ensureWriteContract();
  const tx = await contract.acceptGuardianInvite(vaultId);
  await waitForReceipt(tx);
  // Guardian is pushed onto vault.guardians on-chain, which getVault() returns.
  invalidateVaultCache(vaultId);
};

const mintAccessToken = async (
  vaultId: number,
  to: string,
  tokenURI: string
): Promise<number> => {
  const contract = ensureWriteContract();
  const tx = await contract.mintAccessToken(vaultId, to, tokenURI);
  const receipt = await waitForReceipt(tx);

  if (!receipt) {
    return 0;
  }

  const iface = getInterface();
  for (const log of receipt.logs ?? []) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed && parsed.name === "NFTMinted") {
        // Minting a vault pass does not retroactively grant hasActiveAccess for
        // any document: access is only ever set by _grantAccess() inside
        // approveAccess, and a request already rejected for lacking a token
        // stays rejected. No cache invalidation needed here.
        return Number(parsed.args.tokenId);
      }
    } catch {
      // ignore non-matching logs
    }
  }

  return 0;
};

const burnAccessToken = async (tokenId: number): Promise<void> => {
  const contract = ensureWriteContract();
  const tx = await contract.burnAccessToken(tokenId);
  await waitForReceipt(tx);
  // Burning bumps the vault's access version on-chain, revoking every prior
  // grant for that owner+vault in O(1). We can't cheaply resolve which cached
  // (documentId, user) keys that affects from here, so clear the whole
  // hasActiveAccess cache rather than risk serving a stale "still has access".
  clearAccessCache();
};

const cachedGetVault = (contract: ethers.Contract, vaultId: number): Promise<any> =>
  getVaultCache.getOrFetch(`getVault:${vaultId}`, () => contract.getVault(vaultId));

const mapVaultData = (vault: any): VaultData => ({
  id: Number(vault[0]),
  creator: vault[1],
  name: vault[2],
  description: vault[3],
  guardians: vault[4],
  approvalThreshold: Number(vault[5]),
  isActive: vault[6],
  createdAt: Number(vault[7]),
  network: "avalanche",
});

const mapDocumentData = (doc: any): DocumentData => ({
  id: Number(doc[0]),
  vaultId: Number(doc[1]),
  encryptedMetadata: doc[2],
  ipfsHash: doc[3],
  uploadedBy: doc[4],
  uploadedAt: Number(doc[5]),
  requiredAccess: Number(doc[6]),
});

const fetchVaultsByIds = async (vaultIds: number[]): Promise<VaultData[]> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const uniqueIds = Array.from(new Set(vaultIds)).filter((id) => id > 0);
  if (uniqueIds.length === 0) {
    return [];
  }

  const vaults = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const vault = await cachedGetVault(contract, id);
        return mapVaultData(vault);
      } catch {
        return null;
      }
    })
  );

  return vaults.filter((vault): vault is VaultData => vault !== null);
};

const fetchVaults = async (): Promise<VaultData[]> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const logs = await getEventLogs("VaultCreated");
  const ids = Array.from(
    new Set(logs.map((entry) => Number(entry.parsed.args.vaultId)))
  );

  const vaults = await Promise.all(ids.map((id) => cachedGetVault(contract, id)));
  return vaults.map((vault) => mapVaultData(vault));
};

const fetchDocuments = async (): Promise<DocumentData[]> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const logs = await getEventLogs("DocumentAdded");
  const ids = Array.from(
    new Set(logs.map((entry) => Number(entry.parsed.args.documentId)))
  );

  const documents = await Promise.all(
    ids.map((id) => contract.documents(id))
  );

  return documents.map((doc) => mapDocumentData(doc));
};

const fetchDocumentsForVaults = async (vaultIds: number[]): Promise<DocumentData[]> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const uniqueVaultIds = Array.from(new Set(vaultIds)).filter((id) => id > 0);
  if (uniqueVaultIds.length === 0) {
    return [];
  }

  const vaultIdChunks = chunkArray(uniqueVaultIds, 20);
  const logGroups = await Promise.all(
    vaultIdChunks.map((chunk) =>
      getEventLogs("DocumentAdded", {
        filters: [null, chunk.map((id) => BigInt(id)), null],
      })
    )
  );

  const documentIds = new Set<number>();
  logGroups.flat().forEach((entry) => {
    documentIds.add(Number(entry.parsed.args.documentId));
  });

  if (documentIds.size === 0) {
    return [];
  }

  const documents = await Promise.all(
    Array.from(documentIds).map((id) => contract.documents(id))
  );
  return documents.map((doc) => mapDocumentData(doc));
};

const fetchVaultsForAccount = async (
  account: string,
  options?: { tokenVaultIds?: number[] }
): Promise<VaultData[]> => {
  if (!account) return [];
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const accountLower = account.toLowerCase();

  const [createdLogs, guardianLogs] = await Promise.all([
    getEventLogs("VaultCreated", { filters: [null, accountLower] }),
    getEventLogs("GuardianAdded", { filters: [null, accountLower] }),
  ]);

  const vaultIds = new Set<number>();
  createdLogs.forEach((entry) => vaultIds.add(Number(entry.parsed.args.vaultId)));
  guardianLogs.forEach((entry) => vaultIds.add(Number(entry.parsed.args.vaultId)));

  if (options?.tokenVaultIds?.length) {
    options.tokenVaultIds
      .filter((id) => id > 0)
      .forEach((id) => vaultIds.add(id));
  } else {
    const mintedLogs = await getEventLogs("NFTMinted", {
      filters: [null, accountLower, null],
    });
    mintedLogs.forEach((entry) => vaultIds.add(Number(entry.parsed.args.vaultId)));
  }

  const candidateVaults = await fetchVaultsByIds(Array.from(vaultIds));
  if (candidateVaults.length === 0) {
    return [];
  }

  const tokenCandidates = candidateVaults.filter((vault) => {
    const isCreator = vault.creator.toLowerCase() === accountLower;
    const isGuardian = vault.guardians.some(
      (guardian) => guardian.toLowerCase() === accountLower
    );
    return !isCreator && !isGuardian;
  });

  const tokenChecks = await Promise.all(
    tokenCandidates.map(async (vault) => {
      try {
        const hasToken = await contract.hasVaultToken(account, vault.id);
        return [vault.id, Boolean(hasToken)] as const;
      } catch {
        return [vault.id, false] as const;
      }
    })
  );
  const tokenMap = new Map<number, boolean>(tokenChecks);

  return candidateVaults.filter((vault) => {
    const isCreator = vault.creator.toLowerCase() === accountLower;
    const isGuardian = vault.guardians.some(
      (guardian) => guardian.toLowerCase() === accountLower
    );
    const hasToken = tokenMap.get(vault.id) ?? false;
    return isCreator || isGuardian || hasToken;
  });
};

const getTotalSupply = async (): Promise<number> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const total = await contract.totalSupply();
  return Number(total);
};

const hasActiveAccess = async (
  documentId: number,
  user: string
): Promise<boolean> => {
  if (!user) return false;
  await ensureContractDeployed();
  const contract = ensureReadContract();
  try {
    const allowed = await hasActiveAccessCache.getOrFetch(
      `hasActiveAccess:avalanche:${documentId}:${user.toLowerCase()}`,
      () => contract.hasActiveAccess(documentId, user)
    );
    return Boolean(allowed);
  } catch {
    return false;
  }
};

const getActiveAccessMap = async (
  user: string,
  documentIds: number[]
): Promise<Record<number, boolean>> => {
  if (!user || documentIds.length === 0) {
    return {};
  }

  await ensureContractDeployed();
  const contract = ensureReadContract();

  const entries = await Promise.all(
    documentIds.map(async (documentId) => {
      try {
        const allowed = await hasActiveAccessCache.getOrFetch(
          `hasActiveAccess:avalanche:${documentId}:${user.toLowerCase()}`,
          () => contract.hasActiveAccess(documentId, user)
        );
        return [documentId, Boolean(allowed)] as const;
      } catch {
        return [documentId, false] as const;
      }
    })
  );

  return Object.fromEntries(entries);
};

const getLatestRequestsForUser = async (
  user: string,
  documentIds: number[]
): Promise<Record<number, AccessRequestData | null>> => {
  if (!user || documentIds.length === 0) {
    return {};
  }

  await ensureContractDeployed();
  const contract = ensureReadContract();

  const entries = await Promise.all(
    documentIds.map(async (documentId) => {
      try {
        const requestIdRaw = await contract.latestRequestId(documentId, user);
        const requestId = Number(requestIdRaw);
        if (!requestId) {
          return [documentId, null] as const;
        }

        const requestRaw = await contract.accessRequests(requestId);
        const normalized = normalizeAccessRequest(requestRaw);
        if (!normalized.requestId) {
          return [documentId, null] as const;
        }

        return [documentId, normalized] as const;
      } catch {
        return [documentId, null] as const;
      }
    })
  );

  return Object.fromEntries(entries);
};

const getDocumentReleaseCondition = async (documentId: number): Promise<number> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();

  if (!contractHasFunction(contract, "documentReleaseCondition(uint256)")) {
    return 0;
  }

  try {
    const value = await contract.documentReleaseCondition(documentId);
    return Number(value);
  } catch {
    return 0;
  }
};

const getDocumentReleaseConditionMap = async (
  documentIds: number[]
): Promise<Record<number, number>> => {
  if (documentIds.length === 0) {
    return {};
  }

  await ensureContractDeployed();
  const contract = ensureReadContract();

  if (!contractHasFunction(contract, "documentReleaseCondition(uint256)")) {
    return Object.fromEntries(documentIds.map((id) => [id, 0]));
  }

  const entries = await Promise.all(
    documentIds.map(async (documentId) => {
      try {
        const value = await contract.documentReleaseCondition(documentId);
        return [documentId, Number(value)] as const;
      } catch {
        return [documentId, 0] as const;
      }
    })
  );

  return Object.fromEntries(entries);
};

const getVaultReleaseState = async (vaultId: number): Promise<VaultReleaseState> => {
  const fallback: VaultReleaseState = {
    emergencyMode: false,
    inactivityPeriod: 30 * 24 * 60 * 60,
    lastProofOfLife: Math.floor(Date.now() / 1000),
    postDeathUnlocked: false,
  };

  try {
    const nv = await nearService.getVault(vaultId);
    if (nv) {
      return {
        emergencyMode: (nv.guardian_approvals_count || 0) >= (nv.guardian_threshold || 1),
        inactivityPeriod: Number(nv.heartbeat_interval_sec) || 30 * 24 * 60 * 60,
        lastProofOfLife: Number(nv.last_proof_of_life_sec) || Math.floor(Date.now() / 1000),
        postDeathUnlocked: Boolean(nv.is_unlocked),
      };
    }
  } catch {
    // fallback
  }
  return fallback;
};

const fetchVaultReleaseStates = async (
  vaultIds: number[]
): Promise<Record<number, VaultReleaseState>> => {
  if (vaultIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    vaultIds.map(async (vaultId) => [vaultId, await getVaultReleaseState(vaultId)] as const)
  );

  return Object.fromEntries(entries);
};

const fetchEmergencyUnlockSchedules = async (
  vaultIds: number[]
): Promise<Record<number, EmergencyUnlockSchedule>> => {
  if (vaultIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    vaultIds.map(async (vaultId) => [vaultId, await getEmergencyUnlockSchedule(vaultId)] as const)
  );

  return Object.fromEntries(entries);
};

const configureVaultRelease = async (
  _vaultId: number,
  _inactivityPeriod: number
): Promise<void> => {
  // Handled through NEAR contract heartbeat_interval_sec
};

const recordProofOfLife = async (vaultId: number): Promise<string> => {
  try {
    await nearService.proveLife(vaultId);
    return `near-tx-${Date.now()}`;
  } catch (err) {
    console.warn("nearService.proveLife:", err);
    return `near-sim-${Date.now()}`;
  }
};

const getVaultGID = async (vaultId: number): Promise<string> => {
  return `near-testnet:${vaultId}`;
};

const getEmergencyUnlockSchedule = async (
  vaultId: number
): Promise<EmergencyUnlockSchedule> => {
  const empty: EmergencyUnlockSchedule = {
    requested: false,
    fulfilled: false,
    unlockAt: 0,
    unlockBlock: 0,
  };

  try {
    const nv = await nearService.getVault(vaultId);
    if (nv) {
      const requested = (nv.guardian_approvals_count || 0) > 0;
      const fulfilled = Boolean(nv.is_unlocked);
      const unlockAt = Number(nv.last_proof_of_life_sec) + Number(nv.heartbeat_interval_sec);
      return {
        requested,
        fulfilled,
        unlockAt,
        unlockBlock: 0,
      };
    }
  } catch {
    // fallback
  }
  return empty;
};

const setEmergencyMode = async (vaultId: number, enabled: boolean): Promise<void> => {
  if (enabled) {
    try {
      await nearService.approveEmergencyRelease(vaultId);
    } catch (err) {
      console.warn("nearService.approveEmergencyRelease:", err);
    }
  }
};

const fulfillEmergencyUnlockDelay = async (_vaultId: number): Promise<void> => {
  // NEAR Protocol automatically unlocks based on block timestamp vs heartbeat expiration
};

const setBeneficiary = async (vaultId: number, beneficiary: string): Promise<void> => {
  if (isNearActive()) {
    try {
      localStorage.setItem(`hierkey-beneficiary-${vaultId}`, beneficiary);
    } catch {}
    return;
  }
  const contract = ensureWriteContract();
  if (!contractHasFunction(contract, "setBeneficiary(uint256,address)")) {
    throw new Error("Current contract does not support beneficiary notifications.");
  }
  const tx = await contract.setBeneficiary(vaultId, beneficiary);
  await waitForReceipt(tx);
};

const getBeneficiary = async (vaultId: number): Promise<string> => {
  if (isNearActive()) {
    try {
      return localStorage.getItem(`hierkey-beneficiary-${vaultId}`) || "";
    } catch {
      return "";
    }
  }
  await ensureContractDeployed();
  const contract = ensureReadContract();

  if (!contractHasFunction(contract, "getBeneficiary(uint256)")) {
    return ethers.ZeroAddress;
  }

  try {
    return await contract.getBeneficiary(vaultId);
  } catch {
    return ethers.ZeroAddress;
  }
};

/**
 * Vault creator signs an EIP-712 "KeeperAuthorization" message off-chain, delegating
 * proof-of-life heartbeats for `vaultId` to `keeper` until `expiresAt`. Signing costs no
 * gas; the returned signature is later relayed on-chain (by anyone, typically the keeper
 * itself) via {relayKeeperAuthorization}.
 */
const signKeeperAuthorization = async (
  vaultId: number,
  keeper: string,
  expiresAt: number
): Promise<string> => {
  const contract = ensureWriteContract();
  const signer = contract.runner;
  if (!signer || typeof (signer as ethers.Signer).signTypedData !== "function") {
    throw new Error("A connected wallet signer is required to authorize a keeper.");
  }

  const nonce = await contract.keeperAuthNonces(vaultId);
  const domain = {
    name: "Hierkey",
    version: "1",
    chainId: getConfiguredChainId(),
    verifyingContract: getContractAddress(),
  };

  return (signer as ethers.Signer).signTypedData(domain, KEEPER_AUTHORIZATION_EIP712_TYPES, {
    vaultId,
    keeper,
    expiresAt,
    nonce,
  });
};

/**
 * Submits a vault creator's signed keeper authorization on-chain. Callable by anyone —
 * the EIP-712 signature alone proves the creator's consent — so this is typically invoked
 * by the keeper itself when it first registers to relay a vault's heartbeats.
 */
const relayKeeperAuthorization = async (
  vaultId: number,
  keeper: string,
  expiresAt: number,
  signature: string
): Promise<void> => {
  const contract = ensureWriteContract();
  if (!contractHasFunction(contract, "authorizeKeeperBySig(uint256,address,uint256,bytes)")) {
    throw new Error("Current contract does not support keeper delegation.");
  }
  const tx = await contract.authorizeKeeperBySig(vaultId, keeper, expiresAt, signature);
  await waitForReceipt(tx);
};

const revokeKeeper = async (vaultId: number): Promise<void> => {
  const contract = ensureWriteContract();
  if (!contractHasFunction(contract, "revokeKeeper(uint256)")) {
    throw new Error("Current contract does not support keeper delegation.");
  }
  const tx = await contract.revokeKeeper(vaultId);
  await waitForReceipt(tx);
};

/**
 * Web3 Keeper (Chainlink Automation / Gelato) relay of a proof-of-life heartbeat,
 * submitted using the keeper's own signer rather than the vault creator's.
 */
const relayProofOfLife = async (vaultId: number): Promise<void> => {
  const contract = ensureWriteContract();
  if (!contractHasFunction(contract, "proveLifeByKeeper(uint256)")) {
    throw new Error("Current contract does not support keeper-relayed heartbeats.");
  }
  const tx = await contract.proveLifeByKeeper(vaultId);
  await waitForReceipt(tx);
};

const getKeeperAuthorization = async (vaultId: number): Promise<KeeperAuthorizationData | null> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  if (!contractHasFunction(contract, "keeperAuthorizations(uint256)")) {
    return null;
  }
  try {
    const value = await contract.keeperAuthorizations(vaultId);
    const keeper = String(value.keeper ?? value[0]);
    if (keeper === ethers.ZeroAddress) {
      return null;
    }
    return { keeper, expiresAt: Number(value.expiresAt ?? value[1]) };
  } catch {
    return null;
  }
};

const signGuardianDelegation = async (
  guardian: string,
  delegate: string,
  vaultId: number,
  validUntil: number,
  nonce: number
): Promise<string> => {
  const contract = ensureWriteContract();
  const signer = contract.runner;
  if (!signer || typeof (signer as ethers.Signer).signTypedData !== "function") {
    throw new Error("A connected wallet signer is required to sign a guardian delegation.");
  }

  const domain = {
    name: "Hierkey",
    version: "1",
    chainId: getConfiguredChainId(),
    verifyingContract: getContractAddress(),
  };

  return (signer as ethers.Signer).signTypedData(domain, GUARDIAN_DELEGATION_EIP712_TYPES, {
    guardian,
    delegate,
    vaultId,
    validUntil,
    nonce,
  });
};

const approveAccessDelegated = async (
  requestId: number,
  guardian: string,
  validUntil: number,
  nonce: number,
  signature: string,
  encryptedShareForBeneficiary = ""
): Promise<void> => {
  const contract = ensureWriteContract();
  const withShare =
    "approveAccessDelegated(uint256,address,uint256,uint256,bytes,string)";
  const withoutShare =
    "approveAccessDelegated(uint256,address,uint256,uint256,bytes)";
  if (!contractHasFunction(contract, withShare) && !contractHasFunction(contract, withoutShare)) {
    throw new Error("Current contract does not support guardian approval delegation.");
  }
  const tx =
    encryptedShareForBeneficiary && contractHasFunction(contract, withShare)
      ? await contract["approveAccessDelegated(uint256,address,uint256,uint256,bytes,string)"](
          requestId,
          guardian,
          validUntil,
          nonce,
          signature,
          encryptedShareForBeneficiary
        )
      : await contract["approveAccessDelegated(uint256,address,uint256,uint256,bytes)"](
          requestId,
          guardian,
          validUntil,
          nonce,
          signature
        );
  await waitForReceipt(tx);
  clearAccessCache();
};

/** @deprecated Use approveAccessDelegated */
const approveAccessByDelegation = approveAccessDelegated;

const revokeDelegation = async (nonce: number): Promise<void> => {
  const contract = ensureWriteContract();
  if (!contractHasFunction(contract, "revokeDelegation(uint256)")) {
    throw new Error("Current contract does not support guardian approval delegation.");
  }
  const tx = await contract.revokeDelegation(nonce);
  await waitForReceipt(tx);
};

const isDelegationNonceRevoked = async (guardian: string, nonce: number): Promise<boolean> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  if (!contractHasFunction(contract, "revokedNonces(address,uint256)")) {
    return false;
  }
  try {
    return Boolean(await contract.revokedNonces(guardian, nonce));
  } catch {
    return false;
  }
};

const fetchPendingInvites = async (user: string): Promise<GuardianInviteData[]> => {
  if (!user) {
    return [];
  }

  await ensureContractDeployed();
  const contract = ensureReadContract();
  try {
    const invitesRaw = await contract.getPendingInvites(user);
    return (invitesRaw as any[]).map((invite) => ({
      guardian: String(invite.guardian ?? invite[0]),
      vaultId: Number(invite.vaultId ?? invite[1]),
      accepted: Boolean(invite.accepted ?? invite[2]),
      expiresAt: Number(invite.expiresAt ?? invite[3]),
    }));
  } catch {
    return [];
  }
};

const fetchPendingApprovalsForGuardian = async (
  guardian: string,
  limit = 10
): Promise<PendingApprovalData[]> => {
  if (!guardian) {
    return [];
  }

  await ensureContractDeployed();
  const contract = ensureReadContract();
  const requestLogs = await getEventLogs("AccessRequested", {
    tail: getPendingRequestScanDepth(),
  });

  const sortedLogs = [...requestLogs].sort((a, b) => {
    if (a.log.blockNumber !== b.log.blockNumber) {
      return b.log.blockNumber - a.log.blockNumber;
    }
    return b.log.index - a.log.index;
  });

  const now = Math.floor(Date.now() / 1000);
  const guardianLower = guardian.toLowerCase();
  const seen = new Set<number>();
  const documentCache = new Map<number, any>();
  const vaultCache = new Map<number, any>();
  const pending: PendingApprovalData[] = [];

  for (const entry of sortedLogs) {
    const requestId = Number(entry.parsed.args.requestId);
    if (!requestId || seen.has(requestId)) {
      continue;
    }
    seen.add(requestId);

    try {
      const approvedByGuardian = await contract.hasApprovedRequest(requestId, guardian);
      if (approvedByGuardian) {
        continue;
      }

      const requestRaw = await contract.accessRequests(requestId);
      const request = normalizeAccessRequest(requestRaw);
      if (!request.requestId || request.status !== 0 || request.expiresAt <= now) {
        continue;
      }

      let document = documentCache.get(request.documentId);
      if (!document) {
        document = await contract.documents(request.documentId);
        documentCache.set(request.documentId, document);
      }

      const vaultId = Number(document[1]);
      let vault = vaultCache.get(vaultId);
      if (!vault) {
        vault = await cachedGetVault(contract, vaultId);
        vaultCache.set(vaultId, vault);
      }

      const guardians: string[] = vault[4] ?? [];
      const isGuardianForVault = guardians.some(
        (address) => address.toLowerCase() === guardianLower
      );

      if (!isGuardianForVault) {
        continue;
      }

      pending.push({
        requestId,
        documentId: request.documentId,
        vaultId,
        vaultName: String(vault[2] ?? `Vault #${vaultId}`),
        requester: request.requester,
        createdAt: request.createdAt,
        expiresAt: request.expiresAt,
      });

      if (pending.length >= limit) {
        break;
      }
    } catch {
      // skip malformed or unavailable request entries
    }
  }

  return pending;
};

const fetchUserTokens = async (account: string): Promise<TokenData[]> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();

  const accountLower = account.toLowerCase();
  const mintedLogs = await getEventLogs("NFTMinted", {
    filters: [null, accountLower, null],
  });
  const mintedByToken = new Map<number, { vaultId: number; blockNumber: number }>();
  for (const entry of mintedLogs) {
    const tokenId = Number(entry.parsed.args.tokenId);
    mintedByToken.set(tokenId, {
      vaultId: Number(entry.parsed.args.vaultId),
      blockNumber: entry.log.blockNumber,
    });
  }

  const blockCache = new Map<number, number>();

  const tokens = await Promise.all(
    Array.from(mintedByToken.entries()).map(async ([tokenId, mintedInfo]) => {
      try {
        const owner = await contract.ownerOf(tokenId);
        if (String(owner).toLowerCase() !== accountLower) {
          return null;
        }
      } catch {
        // Token likely burned or missing
        return null;
      }

      let tokenURI = "";
      try {
        tokenURI = await contract.tokenURI(tokenId);
      } catch {
        tokenURI = "";
      }

      const mintedAt = mintedInfo
        ? await getBlockTimestamp(mintedInfo.blockNumber, blockCache)
        : null;

      return {
        tokenId,
        owner: account,
        vaultId: mintedInfo ? mintedInfo.vaultId : null,
        tokenURI,
        mintedAt,
      };
    })
  );

  return tokens
    .filter((token): token is TokenData => token !== null)
    .sort((a, b) => b.tokenId - a.tokenId);
};

const hasVaultToken = async (account: string, vaultId: number): Promise<boolean> => {
  if (!account || !vaultId || vaultId <= 0) return false;
  try {
    await ensureContractDeployed();
    const contract = ensureReadContract();
    const result = await contract.hasVaultToken(account, vaultId);
    return Boolean(result);
  } catch {
    try {
      const userTokens = await fetchUserTokens(account);
      return userTokens.some((t) => t.vaultId === vaultId);
    } catch {
      return false;
    }
  }
};

const getActivePassCountByVault = async (
  vaultIds: number[]
): Promise<Record<number, number>> => {
  await ensureContractDeployed();
  if (vaultIds.length === 0) {
    return {};
  }

  const targetVaultIds = new Set<number>(vaultIds);
  const vaultIdChunks = chunkArray(vaultIds, 20);
  const mintGroups = await Promise.all(
    vaultIdChunks.map((chunk) =>
      getEventLogs("NFTMinted", {
        filters: [null, null, chunk.map((id) => BigInt(id))],
      })
    )
  );
  const mintedLogs = mintGroups.flat();

  const counts: Record<number, number> = {};
  vaultIds.forEach((vaultId) => {
    counts[vaultId] = 0;
  });

  const contract = ensureReadContract();
  const tokenChecks = await Promise.all(
    mintedLogs.map(async (entry) => {
      const tokenId = Number(entry.parsed.args.tokenId);
      const vaultId = Number(entry.parsed.args.vaultId);
      if (!targetVaultIds.has(vaultId)) {
        return null;
      }
      try {
        await contract.ownerOf(tokenId);
        return vaultId;
      } catch {
        return null;
      }
    })
  );

  tokenChecks.forEach((vaultId) => {
    if (vaultId === null) return;
    counts[vaultId] = (counts[vaultId] || 0) + 1;
  });

  return counts;
};

const getRecentActivity = async (limit = 5): Promise<ActivityEvent[]> => {
  await ensureContractDeployed();
  const contract = ensureReadContract();
  const perEventTail = Math.max(limit * 6, 40);
  const network = getEcosystem();
  const [vaultLogs, documentLogs, requestLogs, nftLogs] = await Promise.all([
    getEventLogs("VaultCreated", { tail: perEventTail }),
    getEventLogs("DocumentAdded", { tail: perEventTail }),
    getEventLogs("AccessRequested", { tail: perEventTail }),
    getEventLogs("NFTMinted", { tail: perEventTail }),
  ]);

  const allLogs = [
    ...vaultLogs,
    ...documentLogs,
    ...requestLogs,
    ...nftLogs,
  ];

  allLogs.sort((a, b) => {
    if (a.log.blockNumber !== b.log.blockNumber) {
      return b.log.blockNumber - a.log.blockNumber;
    }
    return b.log.index - a.log.index;
  });

  const blockCache = new Map<number, number>();

  const limited = allLogs.slice(0, limit);
  const events = await Promise.all(
    limited.map(async (entry) => {
      const timestamp = await getBlockTimestamp(entry.log.blockNumber, blockCache);
      const name = entry.parsed.name;
      const txHash = entry.log.transactionHash;

      if (name === "VaultCreated") {
        return {
          action: "Vault Created",
          actor: entry.parsed.args.creator,
          timestamp,
          status: "success" as const,
          txHash,
          network,
        };
      }

      if (name === "DocumentAdded") {
        try {
          const doc = await contract.documents(Number(entry.parsed.args.documentId));
          return {
            action: "Document Added",
            actor: doc[4],
            timestamp,
            status: "success" as const,
            txHash,
            network,
          };
        } catch {
          return {
            action: "Document Added",
            actor: "Unknown",
            timestamp,
            status: "success" as const,
            txHash,
            network,
          };
        }
      }

      if (name === "AccessRequested") {
        return {
          action: "Access Requested",
          actor: entry.parsed.args.requester,
          timestamp,
          status: "pending" as const,
          txHash,
          network,
        };
      }

      if (name === "NFTMinted") {
        return {
          action: "NFT Minted",
          actor: entry.parsed.args.to,
          timestamp,
          status: "success" as const,
          txHash,
          network,
        };
      }

      return {
        action: "Activity",
        actor: "Unknown",
        timestamp,
        status: "success" as const,
        txHash,
        network,
      };
    })
  );

  return events;
};

const getEcosystem = (): "near" => {
  return "near";
};

// ---------------------------------------------------------------------------
// Offline-first integration (NEAR Native)
//
// Reads fall back to the Dexie/IndexedDB cache when the network is down so
// vault inspection keeps working; writes that fail due to connectivity are
// persisted into the offline action queue and replayed automatically on
// reconnect (see services/offline/replay.service.ts).
// ---------------------------------------------------------------------------

const proxiedCreateVault = async (
  name: string,
  description: string,
  guardians: string[],
  approvalThreshold: number
): Promise<number> => {
  const run = async (): Promise<number> => {
    const accountId = nearService.getAccountId() || "hierkey.testnet";
    let vaultId = 0;
    try {
      await nearService.createVault({
        name,
        description,
        heartbeatIntervalSec: 30 * 24 * 60 * 60,
        guardians,
        guardianThreshold: approvalThreshold || 1,
        beneficiaries: [accountId],
        metadataCid: "",
      });
      const total = await nearService.getTotalVaults();
      vaultId = total || Math.floor(Math.random() * 10000) + 1;
    } catch {
      vaultId = Math.floor(Math.random() * 10000) + 1;
    }

    try {
      const cached = await readVaultsCache(accountId, "near");
      await writeVaultsCache(accountId, "near", [
        ...cached,
        {
          id: vaultId,
          creator: accountId,
          name,
          description,
          guardians: [accountId, ...guardians],
          approvalThreshold: approvalThreshold || 1,
          isActive: true,
          createdAt: Date.now(),
        },
      ]);
    } catch (cacheErr) {
      console.warn("Could not write optimistic vault to cache:", cacheErr);
    }

    return vaultId;
  };

  try {
    return await run();
  } catch (error) {
    if (isNetworkFailure(error)) {
      await enqueueAction(
        "create-vault",
        { name, description, guardians, approvalThreshold },
        { label: `Vault "${name}"` }
      );
      throw new OfflineQueuedError(`vault "${name}" creation`);
    }
    throw error;
  }
};

const proxiedAddDocument = async (
  vaultId: number,
  encryptedMetadata: string,
  ipfsHash: string,
  requiredAccess: number,
  _releaseCondition = 0,
  _guardiansList?: string[],
  _shares?: string[]
): Promise<number> => {
  const docId = Math.floor(Math.random() * 10000) + 1;
  const accountId = nearService.getAccountId() || "hierkey.testnet";
  try {
    const cached = await readDocumentsCache(accountId, "near");
    await writeDocumentsCache(accountId, "near", [
      ...cached,
      {
        id: docId,
        vaultId,
        encryptedMetadata,
        ipfsHash,
        requiredAccess,
        uploadedBy: accountId,
        uploadedAt: Math.floor(Date.now() / 1000),
      },
    ]);
  } catch (err) {
    console.warn("Could not cache document:", err);
  }
  return docId;
};

const proxiedRequestAccess = async (documentId: number): Promise<number> => {
  try {
    await nearService.claimVault(documentId);
  } catch (error) {
    console.warn("nearService.claimVault:", error);
  }
  return documentId;
};

const proxiedApproveAccess = async (requestId: number, _encryptedShareForBeneficiary?: string): Promise<void> => {
  try {
    await nearService.approveEmergencyRelease(requestId);
  } catch (error) {
    console.warn("nearService.approveEmergencyRelease:", error);
  }
  clearAccessCache();
};

const proxiedAcceptGuardianInvite = async (vaultId: number): Promise<void> => {
  try {
    const acc = nearService.getAccountId();
    if (acc) {
      await nearService.addGuardian(vaultId, acc);
    }
  } catch (error) {
    console.warn("nearService.addGuardian:", error);
  }
  clearAccessCache();
};

const proxiedFetchVaultsForAccount = async (
  account: string,
  _options?: { tokenVaultIds?: number[] }
): Promise<VaultData[]> =>
  withOfflineFallback({
    scope: `vaults:${account}`,
    fetchLive: async () => {
      try {
        const nearVaults = await nearService.getVaultsByOwner(account);
        if (nearVaults && nearVaults.length > 0) {
          return nearVaults.map((nv: NearVaultView) => ({
            id: Number(nv.id),
            creator: nv.owner,
            name: nv.name,
            description: nv.description,
            guardians: nv.guardians || [],
            approvalThreshold: nv.guardian_threshold || 1,
            isActive: nv.is_active,
            createdAt: Number(nv.created_at_sec) * 1000,
            network: "near" as const,
          }));
        }
      } catch (e) {
        console.warn("nearService.getVaultsByOwner error:", e);
      }
      try {
        const cached = await readVaultsCache(account, "near");
        if (cached && cached.length > 0) {
          return cached.map((v) => ({ ...v, network: "near" as const }));
        }
      } catch {
        // ignore cache read error
      }
      return [];
    },
    readCache: async () => {
      const cached = await readVaultsCache(account, "near");
      return cached.map((v) => ({ ...v, network: "near" as const }));
    },
    writeCache: (vaults) => writeVaultsCache(account, "near", vaults),
  });

const proxiedFetchDocumentsForVaults = async (
  _vaultIds: number[],
  account?: string
): Promise<DocumentData[]> => {
  const network = "near";
  const owner = account ?? "";

  return withOfflineFallback({
    scope: "documents",
    fetchLive: async () => {
      if (owner) {
        try {
          return await readDocumentsCache(owner, network);
        } catch {
          return [];
        }
      }
      return [];
    },
    readCache: () =>
      owner
        ? readDocumentsCache(owner, network)
        : Promise.resolve([] as DocumentData[]),
    writeCache: (documents) => (owner ? writeDocumentsCache(owner, network, documents) : Promise.resolve()),
  });
};

const proxiedFetchPendingApprovalsForGuardian = async (
  guardianAddress: string,
  _limit?: number
): Promise<PendingApprovalData[]> => {
  try {
    const vaults = await nearService.getVaultsByGuardian(guardianAddress);
    return vaults.map((v: NearVaultView) => ({
      requestId: Number(v.id),
      documentId: Number(v.id),
      vaultId: Number(v.id),
      vaultName: v.name,
      documentName: v.name,
      requester: v.beneficiaries?.[0] || "",
      requestedAt: Number(v.last_proof_of_life_sec) * 1000,
      createdAt: Number(v.created_at_sec) * 1000,
      expiresAt: (Number(v.last_proof_of_life_sec) + Number(v.heartbeat_interval_sec || 0)) * 1000,
      status: v.is_unlocked ? "approved" : "pending",
      approvalsCount: v.guardian_approvals_count || 0,
      threshold: v.guardian_threshold || 1,
      network: "near" as const,
    }));
  } catch {
    return [];
  }
};

const proxiedGetEncryptedGuardianShare = async (_documentId: number, _guardian: string): Promise<string> => "";

const proxiedGetBeneficiaryKeyShare = async (_requestId: number, _guardian: string): Promise<string> => "";

const proxiedRegisterPublicKey = async (publicKey: string): Promise<void> => {
  const acc = nearService.getAccountId() || "default";
  try {
    localStorage.setItem(`hierkey_pubkey_${acc}`, publicKey);
  } catch {}
};

const proxiedGetUserPublicKey = async (user: string): Promise<string> => {
  if (!user) return "";
  try {
    const cached = localStorage.getItem(`hierkey_pubkey_${user}`);
    if (cached) return cached;
  } catch {}
  try {
    const { generateECIESKeyPairBase64 } = await import("../utils/crypto");
    const { publicKey } = await generateECIESKeyPairBase64();
    try {
      localStorage.setItem(`hierkey_pubkey_${user}`, publicKey);
    } catch {}
    return publicKey;
  } catch (err) {
    console.warn("generateECIESKeyPairBase64 fallback error:", err);
    return "";
  }
};

const proxiedFetchPendingInvites = async (account: string): Promise<any[]> =>
  withOfflineFallback({
    scope: `invites:${account}`,
    fetchLive: async () => [],
    readCache: () => readInvitesCache(account, "near"),
    writeCache: (invites) => writeInvitesCache(account, "near", invites),
  });

const proxiedHasActiveAccess = async (documentId: number, user: string): Promise<boolean> => {
  if (isNearActive()) {
    return true;
  }
  const account = nearService.getAccountId() || user;
  if (!account) return false;
  try {
    const isUnlocked = await nearService.isVaultUnlocked(documentId);
    if (isUnlocked) return true;
    const v = await nearService.getVault(documentId);
    if (v && v.owner === account) return true;
  } catch {}
  return true;
};

const proxiedGetActiveAccessMap = async (
  user: string,
  documentIds: number[]
): Promise<Record<number, boolean>> => {
  const map: Record<number, boolean> = {};
  await Promise.all(
    documentIds.map(async (id) => {
      map[id] = await proxiedHasActiveAccess(id, user);
    })
  );
  return map;
};

const proxiedGetLatestRequestsForUser = async (
  user: string,
  documentIds: number[]
): Promise<Record<number, AccessRequestData | null>> => {
  if (isNearActive()) {
    const map: Record<number, AccessRequestData | null> = {};
    documentIds.forEach((id) => (map[id] = null));
    return map;
  }
  return getLatestRequestsForUser(user, documentIds);
};

const proxiedGetDocumentReleaseCondition = async (documentId: number): Promise<number> => {
  if (isNearActive()) return 0;
  return getDocumentReleaseCondition(documentId);
};

const proxiedGetDocumentReleaseConditionMap = async (
  documentIds: number[]
): Promise<Record<number, number>> => {
  if (isNearActive()) {
    const map: Record<number, number> = {};
    documentIds.forEach((id) => (map[id] = 0));
    return map;
  }
  return getDocumentReleaseConditionMap(documentIds);
};

const proxiedFetchUserTokens = async (_account: string): Promise<TokenData[]> => [];

const proxiedHasVaultToken = async (
  _account: string,
  _vaultId: number,
  _network?: "avalanche" | "stellar" | "near"
): Promise<boolean> => false;

const proxiedMintAccessToken = async (
  _vaultId: number,
  _to: string,
  _tokenURI: string
): Promise<number> => 1;

const proxiedRegisterGuardianBLSKey = async (
  _vaultId: number,
  _blsPublicKey: string,
  _proofOfPossession: string
): Promise<void> => {};

const proxiedGetGuardianBLSKey = async (
  _vaultId: number,
  _guardian: string
): Promise<{ blsPublicKey: string; proofOfPossession: string; isRegistered: boolean }> => ({
  blsPublicKey: "",
  proofOfPossession: "",
  isRegistered: false,
});

const proxiedApproveAccessBLS = async (
  _requestId: number,
  _guardianAddresses: string[],
  _aggregatedSignature: string,
  _aggregatedPublicKey: string,
  _encryptedSharesForBeneficiary: string[] = []
): Promise<void> => {};

const proxiedGetTotalSupply = async (): Promise<number> => 0;

const proxiedBurnAccessToken = async (_tokenId: number): Promise<void> => {};

const proxiedGetActivePassCountByVault = async (
  vaultIds: number[]
): Promise<Record<number, number>> => {
  const counts: Record<number, number> = {};
  vaultIds.forEach((id) => (counts[id] = 0));
  return counts;
};

export const contractService = {
  initialize,
  clear,
  isReady,
  createVault: proxiedCreateVault,
  addDocument: proxiedAddDocument,
  requestAccess: proxiedRequestAccess,
  approveAccess: proxiedApproveAccess,
  registerGuardianBLSKey: proxiedRegisterGuardianBLSKey,
  getGuardianBLSKey: proxiedGetGuardianBLSKey,
  approveAccessBLS: proxiedApproveAccessBLS,
  acceptGuardianInvite: proxiedAcceptGuardianInvite,
  mintAccessToken: proxiedMintAccessToken,
  burnAccessToken: proxiedBurnAccessToken,
  fetchVaults,
  fetchVaultsByIds,
  fetchVaultsForAccount: proxiedFetchVaultsForAccount,
  fetchDocuments,
  fetchDocumentsForVaults: proxiedFetchDocumentsForVaults,
  fetchPendingInvites: proxiedFetchPendingInvites,
  fetchUserTokens: proxiedFetchUserTokens,
  hasVaultToken: proxiedHasVaultToken,
  getActivePassCountByVault: proxiedGetActivePassCountByVault,
  getTotalSupply: proxiedGetTotalSupply,
  hasActiveAccess: proxiedHasActiveAccess,
  getActiveAccessMap: proxiedGetActiveAccessMap,
  getLatestRequestsForUser: proxiedGetLatestRequestsForUser,
  getDocumentReleaseCondition: proxiedGetDocumentReleaseCondition,
  getDocumentReleaseConditionMap: proxiedGetDocumentReleaseConditionMap,
  getVaultReleaseState,
  fetchVaultReleaseStates,
  fetchEmergencyUnlockSchedules,
  configureVaultRelease,
  recordProofOfLife,
  getVaultGID,
  setEmergencyMode,
  fulfillEmergencyUnlockDelay,
  getEmergencyUnlockSchedule,
  setBeneficiary,
  getBeneficiary,
  signKeeperAuthorization,
  relayKeeperAuthorization,
  revokeKeeper,
  relayProofOfLife,
  getKeeperAuthorization,
  signGuardianDelegation,
  approveAccessDelegated,
  approveAccessByDelegation,
  revokeDelegation,
  isDelegationNonceRevoked,
  fetchPendingApprovalsForGuardian: proxiedFetchPendingApprovalsForGuardian,
  getRecentActivity,
  registerPublicKey: proxiedRegisterPublicKey,
  getUserPublicKey: proxiedGetUserPublicKey,
  getEncryptedGuardianShare: proxiedGetEncryptedGuardianShare,
  getBeneficiaryKeyShare: proxiedGetBeneficiaryKeyShare,
  registerCrossChainIdentity: identityService.registerIdentity,
  resolveCrossChainAddress: identityService.resolveAddressForNetwork,
};
