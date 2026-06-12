import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Suas credenciais exatas (tiradas da sua imagem)
const firebaseConfig = {
  apiKey: "AIzaSyBu8l5sTVyNmkiSSrBuJkFszNNk2dj1ocE",
  authDomain: "web-clientcore.firebaseapp.com",
  projectId: "web-clientcore",
  storageBucket: "web-clientcore.firebasestorage.app",
  messagingSenderId: "847128239865",
  appId: "1:847128239865:web:a28c92f1bd0ad290d40c28",
  measurementId: "G-86N4XXP13R"
};

// Inicializa o aplicativo do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Banco de Dados Firestore e o exporta para podermos usar em outras telas
export const db = getFirestore(app);