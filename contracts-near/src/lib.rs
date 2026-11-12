use near_sdk::json_types::U64;
use near_sdk::{env, near, require, AccountId, PanicOnDefault};
use std::collections::{HashMap, HashSet};

const SECONDS_TO_NANOS: u64 = 1_000_000_000;

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug)]
pub struct ClaimRecord {
    pub beneficiary: AccountId,
    pub claimed_at_ns: u64,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug)]
pub struct Vault {
    pub id: u64,
    pub owner: AccountId,
    pub name: String,
    pub description: String,
    pub heartbeat_interval_ns: u64,
    pub last_proof_of_life_ns: u64,
    pub guardians: Vec<AccountId>,
    pub guardian_threshold: u32,
    pub beneficiaries: Vec<AccountId>,
    pub authorized_keeper: Option<AccountId>,
    pub is_active: bool,
    pub created_at_ns: u64,
    pub metadata_cid: String,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, Debug)]
pub struct VaultView {
    pub id: U64,
    pub owner: AccountId,
    pub name: String,
    pub description: String,
    pub heartbeat_interval_sec: U64,
    pub last_proof_of_life_sec: U64,
    pub guardians: Vec<AccountId>,
    pub guardian_threshold: u32,
    pub beneficiaries: Vec<AccountId>,
    pub authorized_keeper: Option<AccountId>,
    pub is_active: bool,
    pub created_at_sec: U64,
    pub metadata_cid: String,
    pub is_unlocked: bool,
    pub remaining_time_sec: U64,
    pub guardian_approvals_count: u32,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct HierkeyContract {
    pub next_vault_id: u64,
    pub vaults: HashMap<u64, Vault>,
    pub guardian_approvals: HashMap<u64, HashSet<AccountId>>,
    pub claims: HashMap<u64, Vec<ClaimRecord>>,
    pub owner_vaults: HashMap<AccountId, Vec<u64>>,
    pub beneficiary_vaults: HashMap<AccountId, Vec<u64>>,
    pub guardian_vaults: HashMap<AccountId, Vec<u64>>,
}

#[near]
impl HierkeyContract {
    #[init]
    pub fn new() -> Self {
        require!(!env::state_exists(), "Already initialized");
        Self {
            next_vault_id: 1,
            vaults: HashMap::new(),
            guardian_approvals: HashMap::new(),
            claims: HashMap::new(),
            owner_vaults: HashMap::new(),
            beneficiary_vaults: HashMap::new(),
            guardian_vaults: HashMap::new(),
        }
    }

    /// Create a new sovereign vault with dead man's switch interval and guardians.
    pub fn create_vault(
        &mut self,
        name: String,
        description: String,
        heartbeat_interval_sec: U64,
        guardians: Vec<AccountId>,
        guardian_threshold: u32,
        beneficiaries: Vec<AccountId>,
        authorized_keeper: Option<AccountId>,
        metadata_cid: String,
    ) -> U64 {
        let caller = env::predecessor_account_id();
        let interval_sec: u64 = heartbeat_interval_sec.into();
        require!(interval_sec > 0, "Heartbeat interval must be greater than zero");
        require!(!beneficiaries.is_empty(), "Must specify at least one beneficiary");

        if !guardians.is_empty() {
            require!(
                guardian_threshold > 0 && guardian_threshold <= guardians.len() as u32,
                "Invalid guardian approval threshold"
            );
        }

        let vault_id = self.next_vault_id;
        self.next_vault_id += 1;

        let now_ns = env::block_timestamp();
        let interval_ns = interval_sec.saturating_mul(SECONDS_TO_NANOS);

        let vault = Vault {
            id: vault_id,
            owner: caller.clone(),
            name,
            description,
            heartbeat_interval_ns: interval_ns,
            last_proof_of_life_ns: now_ns,
            guardians: guardians.clone(),
            guardian_threshold,
            beneficiaries: beneficiaries.clone(),
            authorized_keeper,
            is_active: true,
            created_at_ns: now_ns,
            metadata_cid,
        };

        self.vaults.insert(vault_id, vault);
        self.owner_vaults.entry(caller).or_default().push(vault_id);

        for beneficiary in &beneficiaries {
            self.beneficiary_vaults
                .entry(beneficiary.clone())
                .or_default()
                .push(vault_id);
        }

        for guardian in &guardians {
            self.guardian_vaults
                .entry(guardian.clone())
                .or_default()
                .push(vault_id);
        }

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"hierkey\",\"version\":\"1.0.0\",\"event\":\"vault_created\",\"data\":[{{\"vault_id\":\"{}\"}}]}}",
            vault_id
        ));

        U64(vault_id)
    }

    /// Prove life and reset the dead man's switch heartbeat countdown.
    /// Can be called by:
    /// 1. The vault owner (including via Function-Call Access Key restricted to prove_life)
    /// 2. An authorized keeper account registered by the owner
    pub fn prove_life(&mut self, vault_id: U64) {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get_mut(&id).expect("Vault not found");
        require!(vault.is_active, "Vault is not active");

        let caller = env::predecessor_account_id();
        let is_owner = caller == vault.owner;
        let is_keeper = vault.authorized_keeper.as_ref() == Some(&caller);

        require!(
            is_owner || is_keeper,
            "Unauthorized: caller is neither owner nor authorized keeper"
        );

        let now_ns = env::block_timestamp();
        vault.last_proof_of_life_ns = now_ns;

        // Reset any pending guardian emergency approvals on fresh proof of life
        self.guardian_approvals.remove(&id);

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"hierkey\",\"version\":\"1.0.0\",\"event\":\"proof_of_life\",\"data\":[{{\"vault_id\":\"{}\",\"timestamp\":{}}}]}}",
            id, now_ns
        ));
    }

    /// Authorize or update a keeper account (e.g. automated relayer).
    pub fn authorize_keeper(&mut self, vault_id: U64, keeper: Option<AccountId>) {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get_mut(&id).expect("Vault not found");
        require!(vault.owner == env::predecessor_account_id(), "Only owner can configure keeper");
        vault.authorized_keeper = keeper;
    }

    /// Guardian submits approval for emergency unlock.
    pub fn approve_emergency_release(&mut self, vault_id: U64) {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get(&id).expect("Vault not found");
        require!(vault.is_active, "Vault is not active");

        let caller = env::predecessor_account_id();
        require!(
            vault.guardians.contains(&caller),
            "Caller is not a designated guardian"
        );

        let approvals = self.guardian_approvals.entry(id).or_default();
        approvals.insert(caller.clone());

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"hierkey\",\"version\":\"1.0.0\",\"event\":\"guardian_approved\",\"data\":[{{\"vault_id\":\"{}\",\"guardian\":\"{}\",\"total_approvals\":{}}}]}}",
            id, caller, approvals.len()
        ));
    }

    /// Beneficiary claims the vault once the dead man's switch timer has lapsed or guardian threshold is met.
    pub fn claim_vault(&mut self, vault_id: U64) -> ClaimRecord {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get(&id).expect("Vault not found");
        require!(vault.is_active, "Vault is not active");

        let caller = env::predecessor_account_id();
        require!(
            vault.beneficiaries.contains(&caller),
            "Caller is not a designated beneficiary"
        );

        let is_unlocked = self.internal_is_vault_unlocked(vault);
        require!(
            is_unlocked,
            "Vault is still locked: heartbeat has not expired and guardian quorum not reached"
        );

        let now_ns = env::block_timestamp();
        let claim = ClaimRecord {
            beneficiary: caller.clone(),
            claimed_at_ns: now_ns,
        };

        self.claims.entry(id).or_default().push(claim.clone());

        env::log_str(&format!(
            "EVENT_JSON:{{\"standard\":\"hierkey\",\"version\":\"1.0.0\",\"event\":\"vault_claimed\",\"data\":[{{\"vault_id\":\"{}\",\"beneficiary\":\"{}\",\"timestamp\":{}}}]}}",
            id, caller, now_ns
        ));

        claim
    }

    /// Add a guardian to an active vault.
    pub fn add_guardian(&mut self, vault_id: U64, guardian: AccountId) {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get_mut(&id).expect("Vault not found");
        require!(vault.owner == env::predecessor_account_id(), "Only owner can add guardians");
        require!(!vault.guardians.contains(&guardian), "Guardian already exists");

        vault.guardians.push(guardian.clone());
        self.guardian_vaults.entry(guardian).or_default().push(id);
    }

    /// Add a beneficiary to an active vault.
    pub fn add_beneficiary(&mut self, vault_id: U64, beneficiary: AccountId) {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get_mut(&id).expect("Vault not found");
        require!(vault.owner == env::predecessor_account_id(), "Only owner can add beneficiaries");
        require!(!vault.beneficiaries.contains(&beneficiary), "Beneficiary already exists");

        vault.beneficiaries.push(beneficiary.clone());
        self.beneficiary_vaults.entry(beneficiary).or_default().push(id);
    }

    /// Terminate / deactivate a vault.
    pub fn terminate_vault(&mut self, vault_id: U64) {
        let id: u64 = vault_id.into();
        let vault = self.vaults.get_mut(&id).expect("Vault not found");
        require!(vault.owner == env::predecessor_account_id(), "Only owner can terminate vault");
        vault.is_active = false;
    }

    // --- VIEW ENTRYPOINTS ---

    pub fn get_vault(&self, vault_id: U64) -> Option<VaultView> {
        let id: u64 = vault_id.into();
        self.vaults.get(&id).map(|v| self.format_vault_view(v))
    }

    pub fn is_vault_unlocked(&self, vault_id: U64) -> bool {
        let id: u64 = vault_id.into();
        match self.vaults.get(&id) {
            Some(v) => self.internal_is_vault_unlocked(v),
            None => false,
        }
    }

    pub fn get_vaults_by_owner(&self, owner: AccountId) -> Vec<VaultView> {
        self.owner_vaults
            .get(&owner)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.vaults.get(id))
                    .map(|v| self.format_vault_view(v))
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn get_vaults_by_beneficiary(&self, beneficiary: AccountId) -> Vec<VaultView> {
        self.beneficiary_vaults
            .get(&beneficiary)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.vaults.get(id))
                    .map(|v| self.format_vault_view(v))
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn get_vaults_by_guardian(&self, guardian: AccountId) -> Vec<VaultView> {
        self.guardian_vaults
            .get(&guardian)
            .map(|ids| {
                ids.iter()
                    .filter_map(|id| self.vaults.get(id))
                    .map(|v| self.format_vault_view(v))
                    .collect()
            })
            .unwrap_or_default()
    }

    pub fn get_claims(&self, vault_id: U64) -> Vec<ClaimRecord> {
        let id: u64 = vault_id.into();
        self.claims.get(&id).cloned().unwrap_or_default()
    }

    pub fn get_guardian_approvals(&self, vault_id: U64) -> Vec<AccountId> {
        let id: u64 = vault_id.into();
        self.guardian_approvals
            .get(&id)
            .map(|set| set.iter().cloned().collect())
            .unwrap_or_default()
    }

    pub fn get_total_vaults(&self) -> U64 {
        U64(self.next_vault_id - 1)
    }

    // --- INTERNAL HELPERS ---

    fn internal_is_vault_unlocked(&self, vault: &Vault) -> bool {
        if !vault.is_active {
            return false;
        }

        let now_ns = env::block_timestamp();
        let elapsed = now_ns.saturating_sub(vault.last_proof_of_life_ns);
        let timer_expired = elapsed >= vault.heartbeat_interval_ns;

        if timer_expired {
            return true;
        }

        if vault.guardian_threshold > 0 {
            if let Some(approvals) = self.guardian_approvals.get(&vault.id) {
                if approvals.len() as u32 >= vault.guardian_threshold {
                    return true;
                }
            }
        }

        false
    }

    fn format_vault_view(&self, vault: &Vault) -> VaultView {
        let now_ns = env::block_timestamp();
        let is_unlocked = self.internal_is_vault_unlocked(vault);

        let elapsed = now_ns.saturating_sub(vault.last_proof_of_life_ns);
        let remaining_ns = vault.heartbeat_interval_ns.saturating_sub(elapsed);
        let remaining_sec = remaining_ns / SECONDS_TO_NANOS;

        let approval_count = self
            .guardian_approvals
            .get(&vault.id)
            .map(|set| set.len() as u32)
            .unwrap_or(0);

        VaultView {
            id: U64(vault.id),
            owner: vault.owner.clone(),
            name: vault.name.clone(),
            description: vault.description.clone(),
            heartbeat_interval_sec: U64(vault.heartbeat_interval_ns / SECONDS_TO_NANOS),
            last_proof_of_life_sec: U64(vault.last_proof_of_life_ns / SECONDS_TO_NANOS),
            guardians: vault.guardians.clone(),
            guardian_threshold: vault.guardian_threshold,
            beneficiaries: vault.beneficiaries.clone(),
            authorized_keeper: vault.authorized_keeper.clone(),
            is_active: vault.is_active,
            created_at_sec: U64(vault.created_at_ns / SECONDS_TO_NANOS),
            metadata_cid: vault.metadata_cid.clone(),
            is_unlocked,
            remaining_time_sec: U64(remaining_sec),
            guardian_approvals_count: approval_count,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId, block_timestamp: u64) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .predecessor_account_id(predecessor.clone())
            .signer_account_id(predecessor)
            .block_timestamp(block_timestamp);
        builder
    }

    #[test]
    fn test_vault_creation_and_heartbeat() {
        let owner = accounts(0);
        let context = get_context(owner.clone(), 1_000_000_000);
        testing_env!(context.build());

        let mut contract = HierkeyContract::new();
        let interval_sec = 30 * 24 * 3600; // 30 days
        let guardians = vec![accounts(1), accounts(2)];
        let beneficiaries = vec![accounts(3)];

        let vault_id = contract.create_vault(
            "Crypto Inheritance Vault".to_string(),
            "Seed phrases and master documents".to_string(),
            U64(interval_sec),
            guardians.clone(),
            2,
            beneficiaries.clone(),
            Some(accounts(4)),
            "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi".to_string(),
        );

        assert_eq!(vault_id.0, 1);
        let vault = contract.get_vault(vault_id).expect("Vault should exist");
        assert_eq!(vault.owner, owner);
        assert!(!vault.is_unlocked);
        assert_eq!(vault.guardians.len(), 2);
        assert_eq!(vault.beneficiaries.len(), 1);

        // Advance time to 15 days
        let context2 = get_context(owner.clone(), (1 + 15 * 24 * 3600) * 1_000_000_000);
        testing_env!(context2.build());

        // Prove life
        contract.prove_life(vault_id);
        let vault_after = contract.get_vault(vault_id).unwrap();
        assert_eq!(
            vault_after.last_proof_of_life_sec.0,
            1 + 15 * 24 * 3600
        );
        assert!(!vault_after.is_unlocked);
    }

    #[test]
    fn test_dead_man_switch_expiration() {
        let owner = accounts(0);
        let beneficiary = accounts(3);
        let initial_time = 1_000_000_000u64;
        let context = get_context(owner.clone(), initial_time);
        testing_env!(context.build());

        let mut contract = HierkeyContract::new();
        let interval_sec = 3600; // 1 hour

        let vault_id = contract.create_vault(
            "Quick Timeout Vault".to_string(),
            "Emergency switch".to_string(),
            U64(interval_sec),
            vec![],
            0,
            vec![beneficiary.clone()],
            None,
            "QmTest123".to_string(),
        );

        assert!(!contract.is_vault_unlocked(vault_id));

        // Advance 2 hours in time (> 1 hour heartbeat)
        let expired_time = initial_time + (7200 * SECONDS_TO_NANOS);
        let beneficiary_context = get_context(beneficiary.clone(), expired_time);
        testing_env!(beneficiary_context.build());

        assert!(contract.is_vault_unlocked(vault_id));

        // Beneficiary claims vault
        let claim = contract.claim_vault(vault_id);
        assert_eq!(claim.beneficiary, beneficiary);
        assert_eq!(claim.claimed_at_ns, expired_time);

        let claims = contract.get_claims(vault_id);
        assert_eq!(claims.len(), 1);
    }

    #[test]
    fn test_guardian_emergency_quorum() {
        let owner = accounts(0);
        let g1 = accounts(1);
        let g2 = accounts(2);
        let beneficiary = accounts(3);

        let initial_time = 1_000_000_000u64;
        testing_env!(get_context(owner.clone(), initial_time).build());

        let mut contract = HierkeyContract::new();
        let interval_sec = 100 * 24 * 3600; // 100 days

        let vault_id = contract.create_vault(
            "Guardian Multi-sig Vault".to_string(),
            "Needs 2 guardians to unlock early".to_string(),
            U64(interval_sec),
            vec![g1.clone(), g2.clone()],
            2,
            vec![beneficiary.clone()],
            None,
            "QmGuardianProof".to_string(),
        );

        // Before quorum, still locked
        assert!(!contract.is_vault_unlocked(vault_id));

        // Guardian 1 approves
        testing_env!(get_context(g1.clone(), initial_time + 100).build());
        contract.approve_emergency_release(vault_id);
        assert!(!contract.is_vault_unlocked(vault_id));

        // Guardian 2 approves -> Quorum reached!
        testing_env!(get_context(g2.clone(), initial_time + 200).build());
        contract.approve_emergency_release(vault_id);
        assert!(contract.is_vault_unlocked(vault_id));

        // Beneficiary can claim immediately
        testing_env!(get_context(beneficiary.clone(), initial_time + 300).build());
        let claim = contract.claim_vault(vault_id);
        assert_eq!(claim.beneficiary, beneficiary);
    }

    #[test]
    fn test_authorized_keeper_can_prove_life() {
        let owner = accounts(0);
        let keeper = accounts(4);
        let initial_time = 1_000_000_000u64;
        testing_env!(get_context(owner.clone(), initial_time).build());

        let mut contract = HierkeyContract::new();
        let interval_sec = 3600;

        let vault_id = contract.create_vault(
            "Keeper Automated Vault".to_string(),
            "Relayed by function-call access key or authorized keeper".to_string(),
            U64(interval_sec),
            vec![],
            0,
            vec![accounts(3)],
            Some(keeper.clone()),
            "QmKeeper".to_string(),
        );

        // Keeper sends heartbeat 1800s later
        let heartbeat_time = initial_time + (1800 * SECONDS_TO_NANOS);
        testing_env!(get_context(keeper.clone(), heartbeat_time).build());
        contract.prove_life(vault_id);

        let vault = contract.get_vault(vault_id).unwrap();
        assert_eq!(vault.last_proof_of_life_sec.0, heartbeat_time / SECONDS_TO_NANOS);
    }

    #[test]
    #[should_panic(expected = "Vault is still locked")]
    fn test_beneficiary_cannot_claim_before_lapse() {
        let owner = accounts(0);
        let beneficiary = accounts(3);
        let initial_time = 1_000_000_000u64;
        testing_env!(get_context(owner.clone(), initial_time).build());

        let mut contract = HierkeyContract::new();
        let interval_sec = 86400; // 1 day

        let vault_id = contract.create_vault(
            "Secure Vault".to_string(),
            "Locked".to_string(),
            U64(interval_sec),
            vec![],
            0,
            vec![beneficiary.clone()],
            None,
            "QmTest".to_string(),
        );

        // Advance only 10 minutes
        testing_env!(get_context(beneficiary.clone(), initial_time + (600 * SECONDS_TO_NANOS)).build());
        contract.claim_vault(vault_id);
    }
}
