// IndexedDB storage service for UNMESSIFY
// Uses the 'idb' library for a cleaner async API over raw IndexedDB
// Falls back to localStorage if IndexedDB is unavailable

import { openDB } from 'idb';

const DB_NAME = 'unmessify_db';
const DB_VERSION = 1;

const STORES = {
  USER: 'user',
  TRANSACTIONS: 'transactions',
  PLANNED_MEALS: 'planned_meals',
  SETTINGS: 'settings',
};

// Keep these for backward compat + cloud sync references
const STORAGE_KEYS = {
  USER: 'unmessify_user',
  TRANSACTIONS: 'unmessify_transactions',
  PLANNED_MEALS: 'unmessify_planned_meals',
  SETTINGS: 'unmessify_settings',
};

// ─── IndexedDB Setup ────────────────────────────────────────────────

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Each store uses a single key 'data' to hold the JSON blob
        if (!db.objectStoreNames.contains(STORES.USER)) {
          db.createObjectStore(STORES.USER);
        }
        if (!db.objectStoreNames.contains(STORES.TRANSACTIONS)) {
          db.createObjectStore(STORES.TRANSACTIONS);
        }
        if (!db.objectStoreNames.contains(STORES.PLANNED_MEALS)) {
          db.createObjectStore(STORES.PLANNED_MEALS);
        }
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS);
        }
      },
    });
  }
  return dbPromise;
}

// ─── Generic IndexedDB operations ───────────────────────────────────

const idbStorage = {
  get: async (storeName) => {
    try {
      const db = await getDB();
      return await db.get(storeName, 'data');
    } catch (error) {
      console.error(`IDB read error [${storeName}]:`, error);
      return null;
    }
  },

  set: async (storeName, value) => {
    try {
      const db = await getDB();
      await db.put(storeName, value, 'data');
      return true;
    } catch (error) {
      console.error(`IDB write error [${storeName}]:`, error);
      return false;
    }
  },

  remove: async (storeName) => {
    try {
      const db = await getDB();
      await db.delete(storeName, 'data');
      return true;
    } catch (error) {
      console.error(`IDB remove error [${storeName}]:`, error);
      return false;
    }
  },

  clear: async () => {
    try {
      const db = await getDB();
      await Promise.all(
        Object.values(STORES).map(store => db.delete(store, 'data'))
      );
      return true;
    } catch (error) {
      console.error('IDB clear error:', error);
      return false;
    }
  },
};

// ─── Synchronous localStorage fallback (used during initial load) ───
// Contexts use these for the very first synchronous render, then
// IndexedDB takes over.

const localFallback = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  set: (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  remove: (key) => {
    try { localStorage.removeItem(key); return true; }
    catch { return false; }
  },
};

// ─── Migrate from old localStorage to IndexedDB (one-time) ─────────

async function migrateFromLocalStorage() {
  const migrated = localStorage.getItem('unmessify_idb_migrated');
  if (migrated) return;

  for (const [storeKey, storeName] of Object.entries({
    [STORAGE_KEYS.USER]: STORES.USER,
    [STORAGE_KEYS.TRANSACTIONS]: STORES.TRANSACTIONS,
    [STORAGE_KEYS.PLANNED_MEALS]: STORES.PLANNED_MEALS,
    [STORAGE_KEYS.SETTINGS]: STORES.SETTINGS,
  })) {
    const data = localFallback.get(storeKey);
    if (data !== null) {
      await idbStorage.set(storeName, data);
    }
  }

  localStorage.setItem('unmessify_idb_migrated', 'true');
}

// Run migration on load
migrateFromLocalStorage().catch(console.error);

// ─── Public API (async — mirrors old interface) ─────────────────────

export const userStorage = {
  get: async () => {
    const data = await idbStorage.get(STORES.USER);
    return data || null;
  },
  save: async (user) => {
    await idbStorage.set(STORES.USER, user);
    // Also keep localStorage in sync for fast initial load
    localFallback.set(STORAGE_KEYS.USER, user);
  },
  remove: async () => {
    await idbStorage.remove(STORES.USER);
    localFallback.remove(STORAGE_KEYS.USER);
  },
  exists: async () => {
    return (await idbStorage.get(STORES.USER)) !== null;
  },
  // Synchronous getter for initial render (from localStorage cache)
  getSync: () => localFallback.get(STORAGE_KEYS.USER),
};

export const transactionStorage = {
  getAll: async () => {
    return (await idbStorage.get(STORES.TRANSACTIONS)) || [];
  },
  save: async (transactions) => {
    await idbStorage.set(STORES.TRANSACTIONS, transactions);
    localFallback.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  },
  add: async (transaction) => {
    const transactions = await transactionStorage.getAll();
    transactions.push(transaction);
    await transactionStorage.save(transactions);
  },
  update: async (id, updatedTransaction) => {
    const transactions = await transactionStorage.getAll();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updatedTransaction };
      await transactionStorage.save(transactions);
    }
  },
  remove: async (id) => {
    const transactions = await transactionStorage.getAll();
    const filtered = transactions.filter(t => t.id !== id);
    await transactionStorage.save(filtered);
  },
  getByMonth: async (year, month) => {
    const transactions = await transactionStorage.getAll();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  },
  getByDateRange: async (startDate, endDate) => {
    const transactions = await transactionStorage.getAll();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  },
  // Synchronous getter for initial render
  getAllSync: () => localFallback.get(STORAGE_KEYS.TRANSACTIONS) || [],
};

export const plannedMealStorage = {
  getAll: async () => {
    return (await idbStorage.get(STORES.PLANNED_MEALS)) || [];
  },
  save: async (meals) => {
    await idbStorage.set(STORES.PLANNED_MEALS, meals);
    localFallback.set(STORAGE_KEYS.PLANNED_MEALS, meals);
  },
  add: async (meal) => {
    const meals = await plannedMealStorage.getAll();
    const filtered = meals.filter(
      m => !(m.date === meal.date && m.mealType === meal.mealType)
    );
    filtered.push(meal);
    await plannedMealStorage.save(filtered);
  },
  remove: async (date, mealType) => {
    const meals = await plannedMealStorage.getAll();
    const filtered = meals.filter(
      m => !(m.date === date && m.mealType === mealType)
    );
    await plannedMealStorage.save(filtered);
  },
  getByMonth: async (year, month) => {
    const meals = await plannedMealStorage.getAll();
    return meals.filter(m => {
      const date = new Date(m.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  },
  // Synchronous getter for initial render
  getAllSync: () => localFallback.get(STORAGE_KEYS.PLANNED_MEALS) || [],
};

// Clear all storage
export const clearAllStorage = async () => {
  await idbStorage.clear();
  Object.values(STORAGE_KEYS).forEach(key => {
    try { localStorage.removeItem(key); } catch(e) { /* ignore */ }
  });
};

export { STORAGE_KEYS, STORES };
