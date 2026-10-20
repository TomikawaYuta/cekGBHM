/**
 * GBHM Store — lapisan data tunggal untuk seluruh aplikasi.
 *
 * Master data (panitia/quests/rules): Firebase Firestore — bersama, realtime.
 *   - Dibaca lewat cache in-memory yang diisi onSnapshot (getXxx() tetap sinkron).
 *   - Ditulis hanya oleh admin (dicegah Firestore Rules di server).
 *   - Seed/migrasi: saat admin login pertama, data lama di localStorage diunggah
 *     ke Firestore (atau seed dari js/data/master-data.json jika kosong).
 *
 * Sessions (upload + hasil validasi): localStorage — per-browser, TIDAK dibagikan.
 */
import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import { db, FIREBASE_CONFIGURED } from './firebase-config.js';
import { waitForAuth, isAdminUser, onAuthChange } from './auth.js';

const MASTER = ['panitia', 'quests', 'rules'];

const LS = {
  sessions: 'gbhm.sessions',
  legacyPanitia: 'gbhm.panitia',
  legacyQuests: 'gbhm.quests',
  legacyRules: 'gbhm.rules',
  legacySeeded: 'gbhm.seeded',
};

const META_SEED_ID = 'seed';

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function stripId(item) {
  const copy = { ...item };
  delete copy.id;
  return copy;
}

function docToItem(d) {
  const data = d.data() || {};
  const numId = Number(d.id);
  return { ...data, id: Number.isNaN(numId) ? d.id : numId };
}

function sortById(list) {
  return list.slice().sort((a, b) => Number(a.id) - Number(b.id));
}

function friendlyError(err) {
  if (err && err.code === 'permission-denied') {
    return 'Akses ditolak: hanya akun admin yang bisa mengubah data ini';
  }
  if (err && err.code === 'unavailable') {
    return 'Tidak bisa terhubung ke server — periksa koneksi internet';
  }
  return (err && err.message) || String(err);
}

const cache = {
  panitia: [],
  quests: [],
  rules: [],
};

const listeners = new Set();
let initPromise = null;
let adminNow = false;

function notify(name) {
  listeners.forEach((cb) => {
    try {
      cb(name);
    } catch (e) {
      console.error(e);
    }
  });
}

function redirectLogin() {
  if (!window.location.pathname.endsWith('login.html') && window.location.href.indexOf('login.html') === -1) {
    window.location.href = 'login.html';
  }
}

/**
 * Seed/migrasi — hanya dijalankan akun admin, dan hanya sekali
 * (dilindungi transaksi pada dokumen meta/seed).
 */
async function ensureSeeded() {
  if (!adminNow) return;
  const metaRef = doc(db, 'meta', META_SEED_ID);
  const metaSnap = await getDoc(metaRef);
  if (metaSnap.exists()) return;

  // Siapkan payload SEBELUM transaksi (transaksi hanya boleh baca Firestore).
  let payload;
  let source;
  const legacyPanitia = readLocal(LS.legacyPanitia, []);
  const legacyQuests = readLocal(LS.legacyQuests, []);
  const legacyRules = readLocal(LS.legacyRules, []);

  if (legacyPanitia.length || legacyQuests.length || legacyRules.length) {
    payload = { panitia: legacyPanitia, quests: legacyQuests, rules: legacyRules };
    source = 'migrasi-localstorage';
  } else {
    const res = await fetch('js/data/master-data.json');
    const seed = await res.json();
    payload = {
      panitia: seed.panitia || [],
      quests: seed.quests || [],
      rules: seed.rules || [],
    };
    source = 'seed-master-data.json';
  }

  await runTransaction(db, async (tx) => {
    const meta = await tx.get(metaRef);
    if (meta.exists()) return;
    for (const name of MASTER) {
      for (const item of payload[name] || []) {
        if (item.id === undefined || item.id === null || item.id === '') continue;
        tx.set(doc(db, name, String(item.id)), stripId(item));
      }
    }
    tx.set(metaRef, {
      source,
      at: new Date().toISOString(),
      counts: {
        panitia: payload.panitia.length,
        quests: payload.quests.length,
        rules: payload.rules.length,
      },
    });
  });
}

export const GBHMStore = {
  /**
   * Guard + inisialisasi. Mengembalikan true jika siap, false jika dialihkan ke login.
   * Semua halaman wajib `await GBHMStore.init()` sebelum memakai API lain.
   */
  async init() {
    if (!initPromise) {
      initPromise = (async () => {
        if (!FIREBASE_CONFIGURED) {
          redirectLogin();
          return false;
        }
        const user = await waitForAuth();
        if (!user) {
          redirectLogin();
          return false;
        }
        adminNow = isAdminUser(user);

        // Pasang listener realtime per collection; resolve setelah snapshot pertama.
        await Promise.all(MASTER.map((name) => new Promise((resolve) => {
          let first = true;
          onSnapshot(collection(db, name), (snap) => {
            cache[name] = sortById(snap.docs.map(docToItem));
            if (first) {
              first = false;
              resolve();
            }
            notify(name);
          }, (err) => {
            console.error(`Firestore error (${name}):`, err);
            if (first) {
              first = false;
              resolve();
            }
          });
        })));

        try {
          await ensureSeeded();
        } catch (e) {
          console.error('Seed/migrasi gagal:', e);
        }

        // Jika sesi keluar di tab ini (atau token dicabut), pindah ke login.
        onAuthChange((u) => {
          if (!u) {
            redirectLogin();
          } else {
            adminNow = isAdminUser(u);
          }
        });

        return true;
      })();
    }
    return initPromise;
  },

  /** Langganan perubahan realtime. Callback menerima nama collection. */
  subscribe(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  isAdmin() {
    return adminNow;
  },

  /** Reset data lokal browser (sessions + salinan legacy). Firestore TIDAK ikut terhapus. */
  reset() {
    Object.values(LS).forEach((k) => localStorage.removeItem(k));
  },

  // ---- Panitia ----
  getPanitia() {
    return cache.panitia;
  },

  getPanitiaById(id) {
    return this.getPanitia().find((p) => String(p.id) === String(id)) || null;
  },

  async savePanitia(data, id = null) {
    const list = this.getPanitia();
    if (!data.nama || !data.nim || !data.jabatan || !data.challenge_1 || !data.challenge_2 || !data.challenge_3) {
      throw new Error('Semua field wajib diisi');
    }
    const dup = list.find((p) => p.nim === data.nim && String(p.id) !== String(id));
    if (dup) throw new Error(`NIM ${data.nim} sudah terdaftar atas nama ${dup.nama}`);
    try {
      if (id) {
        const idx = list.findIndex((p) => String(p.id) === String(id));
        if (idx === -1) throw new Error('Data tidak ditemukan');
        const merged = { ...list[idx], ...data, id: list[idx].id };
        await setDoc(doc(db, 'panitia', String(id)), stripId(merged));
        return merged;
      }
      const created = { ...data, id: nextId(list) };
      await setDoc(doc(db, 'panitia', String(created.id)), stripId(created));
      return created;
    } catch (e) {
      if (e && e.message === 'Data tidak ditemukan') throw e;
      throw new Error(friendlyError(e));
    }
  },

  async deletePanitia(id) {
    try {
      await deleteDoc(doc(db, 'panitia', String(id)));
    } catch (e) {
      throw new Error(friendlyError(e));
    }
  },

  // ---- Quests ----
  getQuests() {
    return cache.quests;
  },

  getQuestById(id) {
    return this.getQuests().find((q) => String(q.id) === String(id)) || null;
  },

  async saveQuest(data, id = null) {
    const list = this.getQuests();
    const chapter = Number(data.chapter);
    const target = Number(data.target_jumlah);
    if (!data.angkatan || !data.jenis_quest || !data.deskripsi) {
      throw new Error('Semua field wajib diisi');
    }
    if (![1, 2, 3, 4].includes(chapter)) throw new Error('Chapter harus 1-4');
    if (!Number.isInteger(target) || target < 1) throw new Error('Target jumlah minimal 1');
    try {
      if (id) {
        const idx = list.findIndex((q) => String(q.id) === String(id));
        if (idx === -1) throw new Error('Data tidak ditemukan');
        const merged = { ...list[idx], ...data, chapter, target_jumlah: target, id: list[idx].id };
        await setDoc(doc(db, 'quests', String(id)), stripId(merged));
        return merged;
      }
      const created = { ...data, chapter, target_jumlah: target, id: nextId(list) };
      await setDoc(doc(db, 'quests', String(created.id)), stripId(created));
      return created;
    } catch (e) {
      if (e && e.message === 'Data tidak ditemukan') throw e;
      throw new Error(friendlyError(e));
    }
  },

  async deleteQuest(id) {
    try {
      await deleteDoc(doc(db, 'quests', String(id)));
    } catch (e) {
      throw new Error(friendlyError(e));
    }
  },

  // ---- Rules ----
  getRules() {
    return cache.rules;
  },

  getRuleById(id) {
    return this.getRules().find((r) => String(r.id) === String(id)) || null;
  },

  getMinKata(ruleType) {
    const rule = this.getRules().find((r) => r.rule_type === ruleType);
    return rule ? Number(rule.min_kata) : 3;
  },

  async saveRule(data, id = null) {
    const list = this.getRules();
    const minKata = Number(data.min_kata);
    if (!data.rule_type || !data.deskripsi) throw new Error('Semua field wajib diisi');
    if (!Number.isInteger(minKata) || minKata < 1) throw new Error('Minimum kata minimal 1');
    const dup = list.find((r) => r.rule_type === data.rule_type && String(r.id) !== String(id));
    if (dup) throw new Error(`Rule type "${data.rule_type}" sudah terdaftar`);
    try {
      if (id) {
        const idx = list.findIndex((r) => String(r.id) === String(id));
        if (idx === -1) throw new Error('Data tidak ditemukan');
        const merged = { ...list[idx], ...data, min_kata: minKata, id: list[idx].id };
        await setDoc(doc(db, 'rules', String(id)), stripId(merged));
        return merged;
      }
      const created = { ...data, min_kata: minKata, id: nextId(list) };
      await setDoc(doc(db, 'rules', String(created.id)), stripId(created));
      return created;
    } catch (e) {
      if (e && e.message === 'Data tidak ditemukan') throw e;
      throw new Error(friendlyError(e));
    }
  },

  async deleteRule(id) {
    try {
      await deleteDoc(doc(db, 'rules', String(id)));
    } catch (e) {
      throw new Error(friendlyError(e));
    }
  },

  // ---- Sessions (localStorage, per-browser) ----
  getSessions() {
    return readLocal(LS.sessions, []).slice().sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  },

  getSession(id) {
    return readLocal(LS.sessions, []).find((s) => String(s.id) === String(id)) || null;
  },

  addSession(session) {
    const list = readLocal(LS.sessions, []);
    const created = {
      id: session.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      filename: session.filename,
      uploadedAt: session.uploadedAt || new Date().toISOString(),
      status: session.status || 'completed',
      errorMessage: session.errorMessage || null,
      extractedData: session.extractedData || null,
      results: session.results || [],
    };
    list.push(created);
    writeLocal(LS.sessions, list);
    return created;
  },

  getStats() {
    const sessions = readLocal(LS.sessions, []);
    let lolos = 0;
    let tidakLolos = 0;
    for (const s of sessions) {
      for (const r of s.results || []) {
        if (r.status === 'lolos') lolos += 1;
        else if (r.status === 'tidak_lolos') tidakLolos += 1;
      }
    }
    return {
      totalPanitia: this.getPanitia().length,
      totalQuest: this.getQuests().length,
      totalUploads: sessions.length,
      lolos,
      tidakLolos,
      recentUploads: sessions.slice().sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1)).slice(0, 5),
    };
  },
};

window.GBHMStore = GBHMStore;
