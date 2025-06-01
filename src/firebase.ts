import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCKUBHvRYltiQOEKITsHwo8Mrlrvx5QEek",
  authDomain: "aibro-88ff5.firebaseapp.com",
  projectId: "aibro-88ff5",
  storageBucket: "aibro-88ff5.firebasestorage.app",
  messagingSenderId: "175339901315",
  appId: "1:175339901315:web:751ff6c676d908359926b6",
  measurementId: "G-VFS3KTN3PN"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);