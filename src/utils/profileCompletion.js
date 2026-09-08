// src/utils/profileCompletion.js
//
// Google (and Apple) sign-in only ever provides name/email — SocialAuthService
// (backend) creates the user with phone/location left null, since neither
// provider's identity token carries them. This is the single source of truth
// both the post-social-auth redirect (GoogleSignInButton) and the completion
// page (CompleteProfile) use to decide whether those fields still need
// collecting, so the two can never disagree about what "complete" means.
//
// Password registration already requires phone/location up front (see
// Register.jsx), so in practice this only ever trips for social accounts —
// but it's defined on the data, not the provider, so it also self-resolves
// the moment a user fills the fields in via the normal Profile page.
export const isProfileComplete = (user) =>
    Boolean(user?.phone?.trim()) && Boolean(user?.location?.trim());
