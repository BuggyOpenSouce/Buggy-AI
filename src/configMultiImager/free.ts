import { HF_ACCESS_TOKEN } from '../configImager';

export const FREE_PROVIDERS = [
  {
    id: 'free-1',
    name: 'Free Generator 1',
    model: 'openfree/flux-chatgpt-ghibli-lora',
    modelType: 'fetch',
    available: true,
    busy: false,
  },
  {
    id: 'free-2',
    name: 'Free Generator 2',
    model: 'openfree/flux-chatgpt-ghibli-lora',
    modelType: 'huggingface',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;
const providerCooldowns = new Map<string, number>();
const COOLDOWN_DURATION = 5 * 60 * 1000;

export function getCurrentFreeProvider() {
  while (
    currentProviderIndex < FREE_PROVIDERS.length && 
    isProviderOnCooldown(FREE_PROVIDERS[currentProviderIndex].id)
  ) {
    currentProviderIndex++;
  }

  if (currentProviderIndex >= FREE_PROVIDERS.length) {
    currentProviderIndex = 0;
    throw new Error('All free providers are currently on cooldown. Please try again in a few minutes.');
  }

  return {
    ...FREE_PROVIDERS[currentProviderIndex],
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

export async function generateFreeImage(prompt: string): Promise<Blob> {
  const provider = getCurrentFreeProvider();

  if (provider.modelType === 'fetch') {
    const response = await fetch(
      `https://router.huggingface.co/hf-inference/v1/models/${provider.model}/predictions`,
      {
        headers: {
          Authorization: `Bearer ${HF_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          input: {
            prompt: prompt,
          },
        }),
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