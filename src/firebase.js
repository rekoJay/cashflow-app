// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyDAPX_VIUW4hlLZw5ZkHCy2ZVM3SyIzAfM",
    authDomain: "cashflowapp-ae122.firebaseapp.com",
    projectId: "cashflowapp-ae122",
    storageBucket: "cashflowapp-ae122.firebasestorage.app",
    messagingSenderId: "328757228810",
    appId: "1:328757228810:web:fc64c9df136007253176f3"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export { db };
