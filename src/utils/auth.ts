// project/src/utils/auth.ts
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth'; // Renamed User to FirebaseUser
import { nanoid } from 'nanoid';
import type { UserProfile } from '../types';

export async function signInWithGoogle(): Promise<FirebaseUser | null> { // Changed return type to FirebaseUser
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error; // Re-throw to allow UI to handle it if necessary
  }
}

export function generateBUID(nickname: string): string {
  const sanitizedNickname = nickname
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, '')
    .replace(/\s+/g, '_') // Replace spaces with underscores for BUID
    .slice(0, 20);
  
  return `@${sanitizedNickname}_${nanoid(6)}`;
}

const adjectives = [
  'Mutlu', 'Zeki', 'Parlak', 'Çevik', 'Nazik', 'Cesur', 'Sakin', 'Kibar',
  'Bilge', 'Hızlı', 'Asil', 'İstekli', 'Neşeli', 'Canlı', 'Şen', 'Gururlu',
  'Yaratıcı', 'Dinamik', 'Enerjik', 'Maceracı', 'Hayalperest', 'Kaşif'
];

const nouns = [
  'Panda', 'Tilki', 'Baykuş', 'Aslan', 'Kaplan', 'Kartal', 'Yunus', 'Kurt',
  'Ayı', 'Şahin', 'Geyik', 'Tavşan', 'Ejderha', 'Anka', 'Tekboynuz', 'Griffin',
  'Gezgin', 'Yıldız', 'Nehir', 'Dağ', 'Okyanus', 'Bulut'
];

export function generateGuestName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 100);
  return `${adjective} ${noun} ${number}`;
}

export function createGuestProfile(): Partial<UserProfile> {
  const guestNickname = generateGuestName();
  const buid = generateBUID(guestNickname.replace(/\s+/g, '')); // BUID from nickname without spaces
  return {
    buid: buid,
    nickname: guestNickname,
    email: `${buid}@guest.local`, // Placeholder email for guests
    photoURL: undefined, 
    interests: [],
    birthDate: '', 
    lastUpdated: Date.now(),
    isProfileComplete: false,
  };
}