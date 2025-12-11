import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBNbUoeRxMOCwXvuI__yVKU9-fC-vVtpT4",
  authDomain: "hymdrl-site.firebaseapp.com",
  databaseURL: "https://hymdrl-site-default-rtdb.firebaseio.com",
  projectId: "hymdrl-site",
  storageBucket: "hymdrl-site.firebasestorage.app",
  messagingSenderId: "698783519322",
  appId: "1:698783519322:web:30742a031f16967a46be63",
  measurementId: "G-CFG39YBPWM"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);