/**
 * GBHM Store — lapisan localStorage untuk master data & sesi upload.
 * Seed awal dimuat dari js/data/master-data.json saat pertama kali dibuka.
 */
const KEYS = {
  panitia: 'gbhm.panitia',
  quests: 'gbhm.quests',
  rules: 'gbhm.rules',
  sessions: 'gbhm.sessions',
  seeded: 'gbhm.seeded',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

export const GBHMStore = {
  async init() {
    if (localStorage.getItem(KEYS.seeded) === '1') return;
    const res = await fetch('js/data/master-data.json');
    const seed = await res.json();
    write(KEYS.panitia, seed.panitia || []);
    write(KEYS.quests, seed.quests || []);
    write(KEYS.rules, seed.rules || []);
    write(KEYS.sessions, []);
    localStorage.setItem(KEYS.seeded, '1');
  },

  reset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },

  // ---- Panitia ----
  getPanitia() {
    return read(KEYS.panitia, []);
  },

  getPanitiaById(id) {
    return this.getPanitia().find((p) => String(p.id) === String(id)) || null;
  },

  savePanitia(data, id = null) {
    const list = this.getPanitia();
    if (!data.nama || !data.nim || !data.jabatan || !data.challenge_1 || !data.challenge_2 || !data.challenge_3) {
      throw new Error('Semua field wajib diisi');
    }
    const dup = list.find((p) => p.nim === data.nim && String(p.id) !== String(id));
    if (dup) throw new Error(`NIM ${data.nim} sudah terdaftar atas nama ${dup.nama}`);
    if (id) {
      const idx = list.findIndex((p) => String(p.id) === String(id));
      if (idx === -1) throw new Error('Data tidak ditemukan');
      list[idx] = { ...list[idx], ...data, id: list[idx].id };
      write(KEYS.panitia, list);
      return list[idx];
    }
    const created = { ...data, id: nextId(list) };
    list.push(created);
    write(KEYS.panitia, list);
    return created;
  },

  deletePanitia(id) {
    const list = this.getPanitia().filter((p) => String(p.id) !== String(id));
    write(KEYS.panitia, list);
  },

  // ---- Quests ----
  getQuests() {
    return read(KEYS.quests, []);
  },

  getQuestById(id) {
    return this.getQuests().find((q) => String(q.id) === String(id)) || null;
  },

  saveQuest(data, id = null) {
    const list = this.getQuests();
    const chapter = Number(data.chapter);
    const target = Number(data.target_jumlah);
    if (!data.angkatan || !data.jenis_quest || !data.deskripsi) {
      throw new Error('Semua field wajib diisi');
    }
    if (![1, 2, 3, 4].includes(chapter)) throw new Error('Chapter harus 1-4');
    if (!Number.isInteger(target) || target < 1) throw new Error('Target jumlah minimal 1');
    if (id) {
      const idx = list.findIndex((q) => String(q.id) === String(id));
      if (idx === -1) throw new Error('Data tidak ditemukan');
      list[idx] = { ...list[idx], ...data, chapter, target_jumlah: target, id: list[idx].id };
      write(KEYS.quests, list);
      return list[idx];
    }
    const created = { ...data, chapter, target_jumlah: target, id: nextId(list) };
    list.push(created);
    write(KEYS.quests, list);
    return created;
  },

  deleteQuest(id) {
    const list = this.getQuests().filter((q) => String(q.id) !== String(id));
    write(KEYS.quests, list);
  },

  // ---- Rules ----
  getRules() {
    return read(KEYS.rules, []);
  },

  getRuleById(id) {
    return this.getRules().find((r) => String(r.id) === String(id)) || null;
  },

  getMinKata(ruleType) {
    const rule = this.getRules().find((r) => r.rule_type === ruleType);
    return rule ? Number(rule.min_kata) : 3;
  },

  saveRule(data, id = null) {
    const list = this.getRules();
    const minKata = Number(data.min_kata);
    if (!data.rule_type || !data.deskripsi) throw new Error('Semua field wajib diisi');
    if (!Number.isInteger(minKata) || minKata < 1) throw new Error('Minimum kata minimal 1');
    const dup = list.find((r) => r.rule_type === data.rule_type && String(r.id) !== String(id));
    if (dup) throw new Error(`Rule type "${data.rule_type}" sudah terdaftar`);
    if (id) {
      const idx = list.findIndex((r) => String(r.id) === String(id));
      if (idx === -1) throw new Error('Data tidak ditemukan');
      list[idx] = { ...list[idx], ...data, min_kata: minKata, id: list[idx].id };
      write(KEYS.rules, list);
      return list[idx];
    }
    const created = { ...data, min_kata: minKata, id: nextId(list) };
    list.push(created);
    write(KEYS.rules, list);
    return created;
  },

  deleteRule(id) {
    const list = this.getRules().filter((r) => String(r.id) !== String(id));
    write(KEYS.rules, list);
  },

  // ---- Sessions ----
  getSessions() {
    return read(KEYS.sessions, []).slice().sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1));
  },

  getSession(id) {
    return read(KEYS.sessions, []).find((s) => String(s.id) === String(id)) || null;
  },

  addSession(session) {
    const list = read(KEYS.sessions, []);
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
    write(KEYS.sessions, list);
    return created;
  },

  getStats() {
    const sessions = read(KEYS.sessions, []);
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
