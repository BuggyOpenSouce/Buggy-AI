import { HF_ACCESS_TOKEN } from '../configImager';

export const FAST_PROVIDERS = [
  {
    id: 'fast-1',
    name: 'Fast Generator 1',
    model: 'stabilityai/stable-diffusion-3.5-large-turbo',
    modelType: 'fetch',
    available: true,
    busy: false,
  },
  {
    id: 'fast-2',
    name: 'Fast Generator 2',
    model: 'stabilityai/stable-diffusion-3.5-large-turbo',
    modelType: 'huggingface',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;
const providerCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 5 * 60 * 1000;

export function getCurrentFastProvider() {
  while (
    currentProviderIndex < FAST_PROVIDERS.length && 
    isProviderOnCooldown(FAST_PROVIDERS[currentProviderIndex].id)
  ) {
    currentProviderIndex++;
  }

  if (currentProviderIndex >= FAST_PROVIDERS.length) {
    currentProviderIndex = 0;
    throw new Error('All fast providers are currently on cooldown. Please try again in a few minutes.');
  }

  return {
    ...FAST_PROVIDERS[currentProviderIndex],
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

export async function generateFastImage(prompt: string): Promise<Blob> {
  const provider = getCurrentFastProvider();

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