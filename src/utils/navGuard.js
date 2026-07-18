// Lightweight, module-level "unsaved changes" guard.
//
// Used by CreateSpace.jsx to block silent exits from the listing wizard
// (sidebar links, back button, tab close) behind a confirmation prompt.
// Not React state on purpose — it needs to be readable synchronously inside
// click handlers in DashboardLayout.jsx, which has no knowledge of
// CreateSpace's own state. DashboardLayout listens for the
// "vencome:nav-guard-prompt" event to know when to actually show the modal.

let activeHandler = null;

export function setNavGuard(onConfirmLeave) {
  activeHandler = onConfirmLeave;
}

export function clearNavGuard() {
  activeHandler = null;
}

export function isNavGuardActive() {
  return activeHandler !== null;
}

export function getNavGuardHandler() {
  return activeHandler;
}

// Call from a click/popstate handler that wants to interrupt navigation.
// Returns true if a prompt was shown (caller should preventDefault/cancel
// the navigation), false if there's nothing to guard.
export function requestNavConfirm() {
  if (!activeHandler) return false;
  window.dispatchEvent(new CustomEvent("vencome:nav-guard-prompt"));
  return true;
}
