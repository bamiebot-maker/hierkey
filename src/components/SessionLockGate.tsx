import { useLocation } from "react-router-dom";
import { useSessionLock } from "../hooks/useSessionLock";
import { SessionLockModal } from "./SessionLockModal";

/**
 * App-level glue: runs the session-lock manager and renders the lock modal when
 * the session is auto-locked. Mounted once near the root of the app.
 * Disabled on public marketing routes such as the landing page ("/").
 */
export function SessionLockGate() {
  const location = useLocation();
  const { locked, lockedAccounts, handleUnlock, handleDismiss } = useSessionLock();

  if (
    location.pathname === "/" ||
    location.pathname.startsWith("/docs") ||
    !locked ||
    lockedAccounts.length === 0
  ) {
    return null;
  }

  return (
    <SessionLockModal
      open={locked}
      accounts={lockedAccounts}
      onUnlock={handleUnlock}
      onDismiss={handleDismiss}
    />
  );
}
