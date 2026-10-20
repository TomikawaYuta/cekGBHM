/**
 * Konfigurasi Firebase — ISI dari Firebase Console:
 * Project Settings (ikon gear) → Your apps → SDK setup and configuration → npm/module
 * Ganti setiap nilai placeholder 'ISI_...' di bawah, lalu simpan.
 */
import { initializeApp } from "firebase/app";
import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCFf-nlAzrIN8E3KNqA4izhXmFzR5DlMKQ',
  authDomain: 'cekgbhm.firebaseapp.com',
  projectId: 'cekgbhm',
  storageBucket: 'cekgbhm.firebasestorage.app',
  messagingSenderId: '556562565406',
  appId: '1:556562565406:web:ff8493d1077e137065210f',
};

export const FIREBASE_CONFIGURED = !String(firebaseConfig.apiKey).startsWith('ISI_');

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
