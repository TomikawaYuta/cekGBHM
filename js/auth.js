/**
 * Autentikasi Firebase Auth — form login hanya menerima username + password.
 * Username dikonversi ke <username>@panitia.gbhm sebelum dikirim ke Firebase.
 */
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import { app, FIREBASE_CONFIGURED } from './firebase-config.js';

export const EMAIL_DOMAIN = 'panitia.gbhm';
export const ADMIN_EMAIL = `admin@${EMAIL_DOMAIN}`;

const auth = getAuth(app);

export function usernameToEmail(username) {
  return `${String(username || '').trim().toLowerCase()}@${EMAIL_DOMAIN}`;
}

export function isValidUsername(username) {
  return /^[a-z0-9_]{3,32}$/.test(String(username || '').trim().toLowerCase());
}

export async function login(username, password) {
  if (!FIREBASE_CONFIGURED) {
    throw new Error('Konfigurasi Firebase belum diisi. Edit js/firebase-config.js (lihat README → Setup Firebase).');
  }
  if (!isValidUsername(username)) {
    throw new Error('Username tidak valid: minimal 3 karakter, hanya huruf, angka, atau underscore.');
  }
  if (!password) {
    throw new Error('Password wajib diisi');
  }
  return signInWithEmailAndPassword(auth, usernameToEmail(username), password);
}

export function logout() {
  return signOut(auth);
}

export function waitForAuth() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

export function currentUser() {
  return auth.currentUser;
}

export function isAdminUser(user = auth.currentUser) {
  return !!user && String(user.email || '').toLowerCase() === ADMIN_EMAIL;
}

export function activeUsername(user = auth.currentUser) {
  if (!user) return '';
  return user.displayName || String(user.email || '').split('@')[0];
}

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function friendlyAuthError(err) {
  const code = err && err.code;
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Username atau password salah';
    case 'auth/invalid-email':
      return 'Username tidak valid';
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah — coba lagi';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan login — tunggu beberapa saat lalu coba lagi';
    case 'auth/user-disabled':
      return 'Akun ini dinonaktifkan — hubungi admin';
    default:
      return (err && err.message) || 'Terjadi kesalahan saat login';
  }
}
