import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBob_1dWa_E8WLx36hZxkndb9izKAyXIME",
  authDomain: "hockey-stats-app-8452b.firebaseapp.com",
  projectId: "hockey-stats-app-8452b",
  storageBucket: "hockey-stats-app-8452b.firebasestorage.app",
  messagingSenderId: "965640539843",
  appId: "1:965640539843:web:ac9c9ef4bcede4f573dc76"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
