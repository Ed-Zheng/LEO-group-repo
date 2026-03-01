// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNaNsyN7oW6nLJA4h3lu6mGa1cuKvg_K0",
  authDomain: "prio-c593c.firebaseapp.com",
  databaseURL: "https://prio-c593c-default-rtdb.firebaseio.com",
  projectId: "prio-c593c",
  storageBucket: "prio-c593c.firebasestorage.app",
  messagingSenderId: "254926819227",
  appId: "1:254926819227:web:71693fa4d5392253ba9b3e",
  measurementId: "G-4Q531P9NQF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);