// Arrays for generating random guest names
const adjectives = [
  'Happy', 'Clever', 'Bright', 'Swift', 'Gentle', 'Brave', 'Calm', 'Kind',
  'Wise', 'Quick', 'Noble', 'Eager', 'Jolly', 'Lively', 'Merry', 'Proud'
];

const nouns = [
  'Panda', 'Fox', 'Owl', 'Lion', 'Tiger', 'Eagle', 'Dolphin', 'Wolf',
  'Bear', 'Hawk', 'Deer', 'Rabbit', 'Dragon', 'Phoenix', 'Unicorn', 'Griffin'
];

export function generateGuestName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
}

export function generateGuestId(): string {
  return 'guest_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}