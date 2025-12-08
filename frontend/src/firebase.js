// frontend/src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDWtWeJSB684gXG6DVBWmnYpvL5ar9fnkY",
  authDomain: "gamedealproject.firebaseapp.com",
  projectId: "gamedealproject",
  storageBucket: "gamedealproject.firebasestorage.app",
  messagingSenderId: "73253819880",
  appId: "1:73253819880:web:55d4e79968d846ff09805d"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);