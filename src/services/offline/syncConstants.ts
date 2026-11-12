export const SYNC_TAG = "hierkey-action-sync";

export const MSG_REGISTER_SYNC = "hierkey/register-sync";
export const MSG_REPLAY_QUEUE = "hierkey/replay-queue";
export const MSG_SYNC_STATUS = "hierkey/sync-status";

export interface SpoovaultWorkerMessage {
  type: string;
  supported?: boolean;
}
