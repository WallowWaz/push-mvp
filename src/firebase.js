// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNsagHGzHO6EZtWCSJcTOH1b_FasMms_Y",
  authDomain: "letter-76372.firebaseapp.com",
  projectId: "letter-76372",
  storageBucket: "letter-76372.firebasestorage.app",
  messagingSenderId: "921782676525",
  appId: "1:921782676525:web:a210abd0652bd4ea291ca4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
