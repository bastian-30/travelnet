import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAQM3iIjyPmn6g5sn_sWAhB-IOaks4Bavo",
  authDomain: "travelnet-53faa.firebaseapp.com",
  projectId: "travelnet-53faa",
  storageBucket: "travelnet-53faa.firebasestorage.app",
  messagingSenderId: "543448315320",
  appId: "1:543448315320:web:7badcd9c5924f227fd0b4d",
};

const app: FirebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
