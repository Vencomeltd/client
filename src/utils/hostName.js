// The name a host is shown under to guests: their profile name, else their
// business name, else their first name, else "Host". A VenCome-sounding name
// is only ever shown for VenCome's own (internal) accounts -- a third-party
// host must never look like VenCome owns the space.
// Word start only, so a name like "Stevencombe" is not caught.
const VENCOME_NAME = /\bven\s*com/i;

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

// The server gives every account this placeholder avatar until they upload
// a photo (User.profileImage default), so it counts as no photo.
const DEFAULT_AVATAR = /gravatar\.com\/avatar\/0{32}/;

export function hasProfilePhoto(user) {
  return Boolean(user?.profileImage) && !DEFAULT_AVATAR.test(user.profileImage);
}

// True when guests would see the plain "Host" fallback, or no photo.
export function hostProfileIncomplete(host) {
  return hostPublicName(host) === "Host" || !hasProfilePhoto(host);
}
