// src/utils/profileCompletion.js
//
// Google (and Apple) sign-in only ever provides name/email — SocialAuthService
// (backend) creates the user with phone/location left null, since neither
// provider's identity token carries them, and always as role='buyer' (Google
// has no way to tell us someone is actually a farmer). This is the single
// source of truth both the post-social-auth redirect (GoogleSignInButton)
// and the completion page (CompleteProfile) use to decide whether more
// fields still need collecting, so the two can never disagree about what
// "complete" means — including the farmer-only fields once someone has
// actually chosen that role on the completion page itself.
//
// Password registration already requires phone/location (and, for a farmer,
// farm_name/farm_location) up front — see Register.jsx / RegisterUserRequest
// (backend) — so in practice this only ever trips for social accounts, but
// it's defined on the data, not the provider, so it also self-resolves the
// moment the fields are filled in via the normal Profile page.
export const isProfileComplete = (user) => {
    if (!user) return false;
    if (!user.phone?.trim() || !user.location?.trim()) return false;
    if (user.role !== 'farmer') return true;

    return Boolean(user.farmer_profile?.farm_name?.trim()) && Boolean(user.farmer_profile?.farm_location?.trim());
};
