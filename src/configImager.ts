export const HF_ACCESS_TOKEN = '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';

export const IMAGER_PROVIDERS = [
  {
    id: 'hf-1',
    name: 'imager-1',
    model: 'CompVis/stable-diffusion-v1-4',
    available: true,
    busy: false,
  },
  {
    id: 'hf-2',
    name: 'imager-2',
    model: 'CompVis/stable-diffusion-v1-4',
    available: true,
    busy: false,
  },
  {
    id: 'hf-3',
    name: 'imager-3',
    model: 'CompVis/stable-diffusion-v1-4',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;
const providerCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCurrentProvider() {
  // Skip providers that are on cooldown
  while (
    currentProviderIndex < IMAGER_PROVIDERS.length && 
    isProviderOnCooldown(IMAGER_PROVIDERS[currentProviderIndex].id)
  ) {
    currentProviderIndex++;
  }

  if (currentProviderIndex >= IMAGER_PROVIDERS.length) {
    currentProviderIndex = 0;
    throw new Error('All providers are currently on cooldown. Please try again in a few minutes.');
  }

  return {
    ...IMAGER_PROVIDERS[currentProviderIndex],
    index: currentProviderIndex,
  };
}

export function setProviderCooldown(providerId: string) {
  providerCooldowns.set(providerId, Date.now() + COOLDOWN_DURATION);
}

function isProviderOnCooldown(providerId: string): boolean {
  const cooldownUntil = providerCooldowns.get(providerId);
  if (!cooldownUntil) return false;
  return Date.now() < cooldownUntil;
}

export function setCurrentProvider(index: number) {
  currentProviderIndex = index;
}