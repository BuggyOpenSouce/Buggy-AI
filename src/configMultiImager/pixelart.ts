import { HF_ACCESS_TOKEN } from '../configImager';

export const PIXELART_PROVIDERS = [
  {
    id: 'pixelart-1',
    name: 'Pixel Art Generator 1',
    model: 'nerijs/pixel-art-xl',
    modelType: 'fetch',
    available: true,
    busy: false,
  },
  {
    id: 'pixelart-2',
    name: 'Pixel Art Generator 2',
    model: 'nerijs/pixel-art-xl',
    modelType: 'huggingface',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;
const providerCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 5 * 60 * 1000;

export function getCurrentPixelArtProvider() {
  while (
    currentProviderIndex < PIXELART_PROVIDERS.length && 
    isProviderOnCooldown(PIXELART_PROVIDERS[currentProviderIndex].id)
  ) {
    currentProviderIndex++;
  }

  if (currentProviderIndex >= PIXELART_PROVIDERS.length) {
    currentProviderIndex = 0;
    throw new Error('All pixel art providers are currently on cooldown. Please try again in a few minutes.');
  }

  return {
    ...PIXELART_PROVIDERS[currentProviderIndex],
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

export async function generatePixelArtImage(prompt: string): Promise<Blob> {
  const provider = getCurrentPixelArtProvider();

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