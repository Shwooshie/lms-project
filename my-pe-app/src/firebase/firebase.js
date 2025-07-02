// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "secret",
  authDomain: "pe-lms.firebaseapp.com",
  projectId: "pe-lms",
  storageBucket: "pe-lms.firebasestorage.app",
  messagingSenderId: "134864189295",
  appId: "1:134864189295:web:f62a825f6758704b8e9a9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
