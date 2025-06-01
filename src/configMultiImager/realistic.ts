import { HF_ACCESS_TOKEN } from '../configImager';

export const REALISTIC_PROVIDERS = [
  {
    id: 'realistic-1',
    name: 'Realistic Generator 1',
    model: 'black-forest-labs/FLUX.1-dev',
    modelType: 'fetch',
    available: true,
    busy: false,
  },
  {
    id: 'realistic-2',
    name: 'Realistic Generator 2',
    model: 'black-forest-labs/FLUX.1-dev',
    modelType: 'huggingface',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;
const providerCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCurrentRealisticProvider() {
  while (
    currentProviderIndex < REALISTIC_PROVIDERS.length && 
    isProviderOnCooldown(REALISTIC_PROVIDERS[currentProviderIndex].id)
  ) {
    currentProviderIndex++;
  }

  if (currentProviderIndex >= REALISTIC_PROVIDERS.length) {
    currentProviderIndex = 0;
    throw new Error('All realistic providers are currently on cooldown. Please try again in a few minutes.');
  }

  return {
    ...REALISTIC_PROVIDERS[currentProviderIndex],
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

export async function generateRealisticImage(prompt: string): Promise<Blob> {
  const provider = getCurrentRealisticProvider();

  if (provider.modelType === 'fetch') {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/models/${provider.model}`,
      {
        headers: {
          Authorization: `Bearer ${HF_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );
    return await response.blob();
  } else {
    const { InferenceClient } = await import("@huggingface/inference");
    const client = new InferenceClient(HF_ACCESS_TOKEN);
    return await client.textToImage({
      provider: "hf-inference",
      model: provider.model,
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
    });
  }
}