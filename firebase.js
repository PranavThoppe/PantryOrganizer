'use client'
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAQnTnLonUO8SDjt9V1Sq24siuzzWA4d8I",
    authDomain: "inventory-management-app-61a4b.firebaseapp.com",
    projectId: "inventory-management-app-61a4b",
    storageBucket: "inventory-management-app-61a4b.appspot.com",
    messagingSenderId: "862203681383",
    appId: "1:862203681383:web:5ea7875fa20e8e262b52c2",
    measurementId: "G-V8XQTPYC9Z"
  };
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore };