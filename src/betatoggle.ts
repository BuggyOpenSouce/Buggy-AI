export const BETA_TEST_ENDED = false;

export function setBetaTestEnded(value: boolean) {
  localStorage.setItem('betaTestEnded', value.toString());
}

export function getBetaTestEnded(): boolean {
  return localStorage.getItem('betaTestEnded') === 'true' || BETA_TEST_ENDED;
}