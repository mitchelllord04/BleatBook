import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0E4umql8KYCaBJTcTQkplkrfUflVEDJw",
  authDomain: "bleatbook-21433.firebaseapp.com",
  projectId: "bleatbook-21433",
  storageBucket: "bleatbook-21433.firebasestorage.app",
  messagingSenderId: "881295644158",
  appId: "1:881295644158:web:d3fe14f44d2cf51e7d1caf",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
