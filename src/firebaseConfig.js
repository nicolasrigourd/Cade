
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Importa getFirestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZX9kyjsLJq-DlB-mTJYXGAd_t5Q4OuvE",
  authDomain: "basecadeteria.firebaseapp.com",
  projectId: "basecadeteria",
  storageBucket: "basecadeteria.firebasestorage.app",
  messagingSenderId: "390353313407",
  appId: "1:390353313407:web:a71390e8185b41f16da94a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firestore y exporta la instancia
export const db = getFirestore(app);
