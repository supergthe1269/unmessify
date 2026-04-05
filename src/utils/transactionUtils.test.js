import {
	asTransactionArray,
	createTransactionRecord,
	addTransactionToList,
	updateTransactionInList,
	removeTransactionFromList,
	getCurrentMonthTransactions,
	getTransactionsByDate,
	getRecentTransactions,
	getCurrentMonthTotal,
	getTodayTotal,
} from "./transactionUtils";

describe("transactionUtils", () => {
	const transactions = [
		{ id: "a", date: "2026-04-06T09:00:00.000Z", totalCredits: 20 },
		{ id: "b", date: "2026-04-05T09:00:00.000Z", totalCredits: 40 },
		{ id: "c", date: "2026-03-28T09:00:00.000Z", totalCredits: 60 },
	];

	test("asTransactionArray normalizes non-array input", () => {
		expect(asTransactionArray(transactions)).toHaveLength(3);
		expect(asTransactionArray(null)).toEqual([]);
		expect(asTransactionArray(undefined)).toEqual([]);
	});

	test("createTransactionRecord creates full record", () => {
		const created = createTransactionRecord(
			{ mealName: "Idli", totalCredits: 20, date: "2026-04-06T09:00:00.000Z" },
			"id-1",
			"2026-04-06T10:00:00.000Z",
		);

		expect(created).toEqual({
			id: "id-1",
			mealName: "Idli",
			totalCredits: 20,
			date: "2026-04-06T09:00:00.000Z",
			createdAt: "2026-04-06T10:00:00.000Z",
		});
	});

	test("add, update and remove transaction lifecycle", () => {
		const added = addTransactionToList(transactions, {
			id: "d",
			date: "2026-04-06T11:00:00.000Z",
			totalCredits: 15,
		});
		expect(added).toHaveLength(4);

		const updated = updateTransactionInList(
			added,
			"d",
			{ totalCredits: 25 },
			"2026-04-06T12:00:00.000Z",
		);
		expect(updated.find((t) => t.id === "d").totalCredits).toBe(25);
		expect(updated.find((t) => t.id === "d").updatedAt).toBe(
			"2026-04-06T12:00:00.000Z",
		);

		const removed = removeTransactionFromList(updated, "d");
		expect(removed).toHaveLength(3);
		expect(removed.find((t) => t.id === "d")).toBeUndefined();
	});

	test("filters and totals are date-accurate", () => {
		const now = new Date("2026-04-06T18:00:00.000Z");

		const currentMonth = getCurrentMonthTransactions(transactions, now);
		expect(currentMonth.map((t) => t.id)).toEqual(["a", "b"]);

		const byDate = getTransactionsByDate(
			transactions,
			"2026-04-05T00:00:00.000Z",
		);
		expect(byDate.map((t) => t.id)).toEqual(["b"]);

		const recent = getRecentTransactions(transactions, 7, now);
		expect(recent.map((t) => t.id)).toEqual(["a", "b"]);

		expect(getCurrentMonthTotal(transactions, now)).toBe(60);
		expect(getTodayTotal(transactions, now)).toBe(20);
	});
});
