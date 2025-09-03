import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAZX9kyjsLJq-DlB-mTJYXGAd_t5Q4OuvE",
  authDomain: "basecadeteria.firebaseapp.com",
  projectId: "basecadeteria",
  storageBucket: "basecadeteria.appspot.com", // ✅ corregido
  messagingSenderId: "390353313407",
  appId: "1:390353313407:web:a71390e8185b41f16da94a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
