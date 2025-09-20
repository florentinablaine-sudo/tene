// src/firebase-config.js --- ВРЕМЕННАЯ ВЕРСИЯ ДЛЯ ТЕСТА

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// ВРЕМЕННО ЖЕСТКО ЗАКОДИРОВАННАЯ КОНФИГУРАЦИЯ
const firebaseConfig = {
  apiKey: "AIzaSyAhMZTS-LgXURFr19kmDvVG3mc_j68PkNI",
  authDomain: "tene-9f8c9.firebaseapp.com",
  projectId: "tene-9f8c9",
  storageBucket: "tene-9f8c9.appspot.com", // ИЗМЕНЕНО: более стандартный формат
  messagingSenderId: "1096524923335",
  appId: "1:1096524923335:web:a2662d6197b49fe3bbd9e2"
};

// Инициализируем приложение
const app = initializeApp(firebaseConfig);

// Экспортируем сервисы
export const db = getFirestore(app);
export const auth = getAuth(app);

// Устанавливаем persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Firebase Persistence Error:", error);
  });