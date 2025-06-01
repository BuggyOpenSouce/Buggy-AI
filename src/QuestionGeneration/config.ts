export const QUESTION_PROVIDERS = [
  {
    id: 'questai-1',
    name: 'QuestAI-1',
    key: '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',
    model: 'qwen/qwen2.5-vl-72b-instruct:free',
    available: true,
    busy: false,
  },
  {
    id: 'questai-2',
    name: 'QuestAI-2',
    key: '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',
    model: 'qwen/qwen2.5-vl-72b-instruct:free',
    available: true,
    busy: false,
  }
];

let currentProviderIndex = 0;

export function getCurrentProvider() {
  return {
    ...QUESTION_PROVIDERS[currentProviderIndex],
    index: currentProviderIndex,
  };
}

export function setCurrentProvider(index: number) {
  currentProviderIndex = index;
}