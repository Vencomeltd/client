// The name a host is shown under to guests: their profile name, else their
// business name, else their first name, else "Host". A VenCome-sounding name
// is only ever shown for VenCome's own (internal) accounts -- a third-party
// host must never look like VenCome owns the space.
const VENCOME_NAME = /ven\s*com/i;

export function hostPublicName(host) {
  if (!host) return "Host";
  const ownAccount = host.accountFlag === "internal";
  const candidates = [host.displayName, host.businessVerification?.companyName, host.firstName];
  for (const candidate of candidates) {
    const name = (candidate || "").trim();
    if (name && (ownAccount || !VENCOME_NAME.test(name))) return name;
  }
  return "Host";
}

// True when guests would see the plain "Host" fallback, or no photo.
export function hostProfileIncomplete(host) {
  return hostPublicName(host) === "Host" || !host?.profileImage;
}
