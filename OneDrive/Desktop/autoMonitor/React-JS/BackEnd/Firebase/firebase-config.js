import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "@firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDZMOXjyaXjrHHdOaUGDdCztIlC8_yX0HA",
    authDomain: "auto-monitor-7ccaa.firebaseapp.com",
    projectId: "auto-monitor-7ccaa",
    storageBucket: "auto-monitor-7ccaa.appspot.com",
    messagingSenderId: "742462035579",
    appId: "1:742462035579:web:3d8517e0a95b19ac0674de",
    measurementId: "G-ZQSCNNC2SW"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);