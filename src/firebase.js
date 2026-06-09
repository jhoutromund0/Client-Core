// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBu8l5sTVyNmkiSSrBuJkFszNNk2dj1ocE",
  authDomain: "web-clientcore.firebaseapp.com",
  projectId: "web-clientcore",
  storageBucket: "web-clientcore.firebasestorage.app",
  messagingSenderId: "847128239865",
  appId: "1:847128239865:web:a28c92f1bd0ad290d40c28",
  measurementId: "G-86N4XXP13R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };