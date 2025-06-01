import { HF_ACCESS_TOKEN } from '../configImager';

export const DRAWING_PROVIDERS = [
  {
    id: 'drawing-1',
    name: 'Drawing Generator 1',
    model: 'taki0112/lora-trained-xl_line-drawings_split',
    modelType: 'fetch',
    available: true,
    busy: false,
  },
  {
    id: 'drawing-2',
    name: 'Drawing Generator 2',
    model: 'taki0112/lora-trained-xl_line-drawings_split',
    modelType: 'huggingface',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;
const providerCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 5 * 60 * 1000;

export function getCurrentDrawingProvider() {
  while (
    currentProviderIndex < DRAWING_PROVIDERS.length && 
    isProviderOnCooldown(DRAWING_PROVIDERS[currentProviderIndex].id)
  ) {
    currentProviderIndex++;
  }

  if (currentProviderIndex >= DRAWING_PROVIDERS.length) {
    currentProviderIndex = 0;
    throw new Error('All drawing providers are currently on cooldown. Please try again in a few minutes.');
  }

  return {
    ...DRAWING_PROVIDERS[currentProviderIndex],
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

export async function generateDrawingImage(prompt: string): Promise<Blob> {
  const provider = getCurrentDrawingProvider();

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