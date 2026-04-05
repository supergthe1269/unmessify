export function asTransactionArray(data) {
	return Array.isArray(data) ? data : [];
}

export function createTransactionRecord(transactionData, id, createdAt) {
	return {
		id,
		...transactionData,
		createdAt,
	};
}

export function addTransactionToList(transactions, newTransaction) {
	return [...transactions, newTransaction];
}

export function updateTransactionInList(transactions, id, updates, updatedAt) {
	return transactions.map((t) =>
		t.id === id ? { ...t, ...updates, updatedAt } : t,
	);
}

export function removeTransactionFromList(transactions, id) {
	return transactions.filter((t) => t.id !== id);
}

export function getCurrentMonthTransactions(transactions, now = new Date()) {
	return transactions.filter((t) => {
		const date = new Date(t.date);
		return (
			date.getMonth() === now.getMonth() &&
			date.getFullYear() === now.getFullYear()
		);
	});
}

export function getTransactionsByDate(transactions, date) {
	const dateStr = new Date(date).toISOString().split("T")[0];
	return transactions.filter((t) => t.date.startsWith(dateStr));
}

export function getRecentTransactions(
	transactions,
	days = 7,
	now = new Date(),
) {
	const cutoff = new Date(now);
	cutoff.setDate(cutoff.getDate() - days);
	return transactions.filter((t) => new Date(t.date) >= cutoff);
}

export function getCurrentMonthTotal(transactions, now = new Date()) {
	return getCurrentMonthTransactions(transactions, now).reduce(
		(sum, t) => sum + t.totalCredits,
		0,
	);
}

export function getTodayTotal(transactions, now = new Date()) {
	const today = now.toISOString().split("T")[0];
	return transactions
		.filter((t) => t.date.startsWith(today))
		.reduce((sum, t) => sum + t.totalCredits, 0);
}
