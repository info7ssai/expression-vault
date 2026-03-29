import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2ffnP2ZpcY8K6yIOYt1ZooSQ3zzr5DbI",
  authDomain: "expression-vault.firebaseapp.com",
  projectId: "expression-vault",
  storageBucket: "expression-vault.firebasestorage.app",
  messagingSenderId: "881643636319",
  appId: "1:881643636319:web:69e7abb0bb6179d730bdea",
  measurementId: "G-0MG5VGS38M"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
