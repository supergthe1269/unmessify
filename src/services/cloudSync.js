// Cloud sync service for UNMESSIFY
// Syncs IndexedDB data with Firestore for cross-device access

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import {
	userStorage,
	transactionStorage,
	plannedMealStorage,
} from "./storageService";

// ─── Firestore document paths ───────────────────────────────────────
// users/{uid} → { profile: {...}, transactions: [...], plannedMeals: [...] }

function userDocRef(uid) {
	return doc(db, "users", uid);
}

// ─── Push local data to Firestore ───────────────────────────────────

export async function pushProfileToCloud(uid, profileData) {
	try {
		const docRef = userDocRef(uid);
		const docSnap = await getDoc(docRef);

		if (docSnap.exists()) {
			await updateDoc(docRef, {
				profile: profileData,
				updatedAt: new Date().toISOString(),
			});
		} else {
			await setDoc(docRef, {
				profile: profileData,
				transactions: [],
				plannedMeals: [],
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			});
		}
		return true;
	} catch (error) {
		console.error("Push profile to cloud failed:", error);
		return false;
	}
}

export async function pushTransactionsToCloud(uid) {
	try {
		const transactions = await transactionStorage.getAll();
		await updateDoc(userDocRef(uid), {
			transactions,
			updatedAt: new Date().toISOString(),
		});
		return true;
	} catch (error) {
		console.error("Push transactions to cloud failed:", error);
		return false;
	}
}

export async function pushPlannedMealsToCloud(uid) {
	try {
		const meals = await plannedMealStorage.getAll();
		await updateDoc(userDocRef(uid), {
			plannedMeals: meals,
			updatedAt: new Date().toISOString(),
		});
		return true;
	} catch (error) {
		console.error("Push planned meals to cloud failed:", error);
		return false;
	}
}

// Push everything
export async function pushAllToCloud(uid) {
	try {
		const profile = await userStorage.get();
		const transactions = await transactionStorage.getAll();
		const meals = await plannedMealStorage.getAll();

		const docRef = userDocRef(uid);
		const docSnap = await getDoc(docRef);

		const data = {
			profile: profile || {},
			transactions: transactions || [],
			plannedMeals: meals || [],
			updatedAt: new Date().toISOString(),
		};

		if (docSnap.exists()) {
			await updateDoc(docRef, data);
		} else {
			await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
		}
		return true;
	} catch (error) {
		console.error("Push all to cloud failed:", error);
		return false;
	}
}

// ─── Pull cloud data into IndexedDB ─────────────────────────────────

export async function pullFromCloud(uid) {
	try {
		const docSnap = await getDoc(userDocRef(uid));

		if (!docSnap.exists()) {
			return null; // No cloud data — first-time user
		}

		const data = docSnap.data();

		// Write cloud data to IndexedDB
		if (data.profile) {
			await userStorage.save(data.profile);
		}
		if (Array.isArray(data.transactions)) {
			await transactionStorage.save(data.transactions);
		}
		if (Array.isArray(data.plannedMeals)) {
			await plannedMealStorage.save(data.plannedMeals);
		}

		return data;
	} catch (error) {
		console.error("Pull from cloud failed:", error);
		return null;
	}
}

// ─── Sync on login (cloud wins) ─────────────────────────────────────

export async function syncOnLogin(uid) {
	try {
		const cloudData = await pullFromCloud(uid);

		if (!cloudData) {
			// No cloud data — push local data up (first-time user with local data)
			await pushAllToCloud(uid);
			return { isNewUser: true, profile: null };
		}

		return { isNewUser: false, profile: cloudData.profile };
	} catch (error) {
		console.error("Sync on login failed:", error);
		return { isNewUser: true, profile: null };
	}
}

// ─── Debounced sync helper ──────────────────────────────────────────

const syncTimers = {};

export function debouncedSync(uid, syncFn, delay = 2000) {
	const key = syncFn.name || "default";
	if (syncTimers[key]) {
		clearTimeout(syncTimers[key]);
	}
	syncTimers[key] = setTimeout(() => {
		syncFn(uid).catch(console.error);
	}, delay);
}
