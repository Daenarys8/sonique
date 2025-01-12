interface FeatureFlags {
  socialLogin: boolean;
  guestMode: boolean;
  multiplayer: boolean;
}

const featureFlags: FeatureFlags = {
  socialLogin: import.meta.env.VITE_FEATURE_SOCIAL_LOGIN === 'true',
  guestMode: import.meta.env.VITE_FEATURE_GUEST_MODE === 'true',
  multiplayer: import.meta.env.VITE_FEATURE_MULTIPLAYER === 'true'
};

export const getFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  if (!(flag in featureFlags)) {
    console.warn(`Feature flag ${flag} not found`);
    return false;
  }
  return featureFlags[flag];
};

export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return getFeatureFlag(flag);
};