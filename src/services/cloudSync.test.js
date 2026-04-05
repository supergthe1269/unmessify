jest.mock("firebase/firestore", () => ({
	doc: jest.fn(),
	getDoc: jest.fn(),
	setDoc: jest.fn(),
	updateDoc: jest.fn(),
}));

jest.mock("./firebaseConfig", () => ({
	db: { __name: "mock-db" },
}));

jest.mock("./storageService", () => ({
	userStorage: {
		get: jest.fn(),
		save: jest.fn(),
	},
	transactionStorage: {
		getAll: jest.fn(),
		save: jest.fn(),
	},
	plannedMealStorage: {
		getAll: jest.fn(),
		save: jest.fn(),
	},
}));

import {
	pushProfileToCloud,
	pullFromCloud,
	syncOnLogin,
	debouncedSync,
} from "./cloudSync";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import {
	userStorage,
	transactionStorage,
	plannedMealStorage,
} from "./storageService";

describe("cloudSync", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		doc.mockReturnValue({ path: "users/u1" });
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test("pushProfileToCloud updates existing cloud profile", async () => {
		getDoc.mockResolvedValue({ exists: () => true });

		const ok = await pushProfileToCloud("u1", { name: "Alice" });

		expect(ok).toBe(true);
		expect(updateDoc).toHaveBeenCalledTimes(1);
		expect(setDoc).not.toHaveBeenCalled();
	});

	test("pushProfileToCloud creates doc when profile does not exist", async () => {
		getDoc.mockResolvedValue({ exists: () => false });

		const ok = await pushProfileToCloud("u1", { name: "Alice" });

		expect(ok).toBe(true);
		expect(setDoc).toHaveBeenCalledTimes(1);
		expect(updateDoc).not.toHaveBeenCalled();
	});

	test("pullFromCloud persists profile and list payloads locally", async () => {
		getDoc.mockResolvedValue({
			exists: () => true,
			data: () => ({
				profile: { name: "Alice" },
				transactions: [{ id: "t1", totalCredits: 20 }],
				plannedMeals: [{ date: "2026-04-01", mealType: "lunch" }],
			}),
		});

		const result = await pullFromCloud("u1");

		expect(result.profile.name).toBe("Alice");
		expect(userStorage.save).toHaveBeenCalledWith({ name: "Alice" });
		expect(transactionStorage.save).toHaveBeenCalledWith([
			{ id: "t1", totalCredits: 20 },
		]);
		expect(plannedMealStorage.save).toHaveBeenCalledWith([
			{ date: "2026-04-01", mealType: "lunch" },
		]);
	});

	test("pullFromCloud should also persist empty arrays to clear stale local data", async () => {
		getDoc.mockResolvedValue({
			exists: () => true,
			data: () => ({
				profile: { name: "Alice" },
				transactions: [],
				plannedMeals: [],
			}),
		});

		await pullFromCloud("u1");

		expect(transactionStorage.save).toHaveBeenCalledWith([]);
		expect(plannedMealStorage.save).toHaveBeenCalledWith([]);
	});

	test("syncOnLogin marks new user when cloud data is absent", async () => {
		getDoc.mockResolvedValue({ exists: () => false });
		userStorage.get.mockResolvedValue(null);
		transactionStorage.getAll.mockResolvedValue([]);
		plannedMealStorage.getAll.mockResolvedValue([]);

		const result = await syncOnLogin("u1");

		expect(result).toEqual({ isNewUser: true, profile: null });
		expect(setDoc).toHaveBeenCalledTimes(1);
	});

	test("debouncedSync calls only the last invocation", async () => {
		jest.useFakeTimers();
		const syncFn = jest.fn().mockResolvedValue(true);

		debouncedSync("u1", syncFn, 100);
		debouncedSync("u1", syncFn, 100);
		debouncedSync("u1", syncFn, 100);

		expect(syncFn).not.toHaveBeenCalled();
		jest.advanceTimersByTime(100);

		expect(syncFn).toHaveBeenCalledTimes(1);
		expect(syncFn).toHaveBeenCalledWith("u1");
	});
});
