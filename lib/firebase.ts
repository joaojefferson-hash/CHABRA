
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Substitua pelas suas chaves do Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy...", 
  authDomain: "chabra-gestao.firebaseapp.com",
  projectId: "chabra-gestao",
  storageBucket: "chabra-gestao.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicializa o Firebase apenas se as chaves estiverem presentes, caso contrário usa modo Mock
const app = firebaseConfig.apiKey.startsWith("AIza") ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const isCloudEnabled = !!db;
