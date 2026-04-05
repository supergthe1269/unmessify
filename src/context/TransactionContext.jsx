import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
	useRef,
} from "react";
import { transactionStorage } from "../services/storageService";
import { pushTransactionsToCloud, debouncedSync } from "../services/cloudSync";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";
import {
	asTransactionArray,
	createTransactionRecord,
	addTransactionToList,
	updateTransactionInList,
	removeTransactionFromList,
	getCurrentMonthTransactions as filterCurrentMonthTransactions,
	getTransactionsByDate as filterTransactionsByDate,
	getRecentTransactions as filterRecentTransactions,
	getCurrentMonthTotal as calculateCurrentMonthTotal,
	getTodayTotal as calculateTodayTotal,
} from "../utils/transactionUtils";

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
	const initialTransactions = asTransactionArray(
		transactionStorage.getAllSync(),
	);

	// Load synchronously from localStorage cache for instant render
	const [transactions, setTransactions] = useState(initialTransactions);
	const transactionsRef = useRef(initialTransactions);
	const writeQueueRef = useRef(Promise.resolve());
	const [isLoading, setIsLoading] = useState(true);
	const { authUser } = useAuth();

	// Ensure transactions is always an array
	const safeSetTransactions = useCallback((data) => {
		const normalized = asTransactionArray(data);
		transactionsRef.current = normalized;
		setTransactions(normalized);
	}, []);

	const persistTransactions = useCallback((nextTransactions) => {
		writeQueueRef.current = writeQueueRef.current
			.catch(() => undefined)
			.then(() => transactionStorage.save(nextTransactions));
		return writeQueueRef.current;
	}, []);

	// Load transactions from IndexedDB on mount (async update)
	useEffect(() => {
		async function loadTransactions() {
			const saved = await transactionStorage.getAll();
			safeSetTransactions(saved);
			setIsLoading(false);
		}
		loadTransactions();
	}, [safeSetTransactions]);

	// Re-load when auth changes (cloud sync might have updated IndexedDB)
	useEffect(() => {
		if (authUser) {
			transactionStorage.getAll().then(safeSetTransactions);
		}
	}, [authUser, safeSetTransactions]);

	// Sync to cloud helper
	const syncToCloud = useCallback(() => {
		if (authUser) {
			debouncedSync(authUser.uid, pushTransactionsToCloud, 2000);
		}
	}, [authUser]);

	// Add a new transaction
	const addTransaction = useCallback(
		async (transactionData) => {
			const newTransaction = createTransactionRecord(
				transactionData,
				uuidv4(),
				new Date().toISOString(),
			);

			const updatedTransactions = addTransactionToList(
				transactionsRef.current,
				newTransaction,
			);
			safeSetTransactions(updatedTransactions);
			await persistTransactions(updatedTransactions);
			syncToCloud();
			return newTransaction;
		},
		[persistTransactions, safeSetTransactions, syncToCloud],
	);

	// Update an existing transaction
	const updateTransaction = useCallback(
		async (id, updates) => {
			const updatedTransactions = updateTransactionInList(
				transactionsRef.current,
				id,
				updates,
				new Date().toISOString(),
			);
			safeSetTransactions(updatedTransactions);
			await persistTransactions(updatedTransactions);
			syncToCloud();
		},
		[persistTransactions, safeSetTransactions, syncToCloud],
	);

	// Delete a transaction
	const deleteTransaction = useCallback(
		async (id) => {
			const updatedTransactions = removeTransactionFromList(
				transactionsRef.current,
				id,
			);
			safeSetTransactions(updatedTransactions);
			await persistTransactions(updatedTransactions);
			syncToCloud();
		},
		[persistTransactions, safeSetTransactions, syncToCloud],
	);

	// Get transactions for current month
	const getCurrentMonthTransactions = useCallback(() => {
		return filterCurrentMonthTransactions(transactions, new Date());
	}, [transactions]);

	// Get transactions for a specific date
	const getTransactionsByDate = useCallback(
		(date) => {
			return filterTransactionsByDate(transactions, date);
		},
		[transactions],
	);

	// Get transactions for last N days
	const getRecentTransactions = useCallback(
		(days = 7) => {
			return filterRecentTransactions(transactions, days, new Date());
		},
		[transactions],
	);

	// Calculate total spent for current month
	const getCurrentMonthTotal = useCallback(() => {
		return calculateCurrentMonthTotal(transactions, new Date());
	}, [transactions]);

	// Calculate total spent today
	const getTodayTotal = useCallback(() => {
		return calculateTodayTotal(transactions, new Date());
	}, [transactions]);

	// Clear all transactions (for resetting data)
	const clearAllTransactions = useCallback(async () => {
		safeSetTransactions([]);
		await persistTransactions([]);
		syncToCloud();
	}, [persistTransactions, safeSetTransactions, syncToCloud]);

	const value = {
		transactions,
		isLoading,
		addTransaction,
		updateTransaction,
		deleteTransaction,
		getCurrentMonthTransactions,
		getTransactionsByDate,
		getRecentTransactions,
		getCurrentMonthTotal,
		getTodayTotal,
		clearAllTransactions,
	};

	return (
		<TransactionContext.Provider value={value}>
			{children}
		</TransactionContext.Provider>
	);
}

// Custom hook for using transaction context
export function useTransactions() {
	const context = useContext(TransactionContext);
	if (context === undefined) {
		throw new Error(
			"useTransactions must be used within a TransactionProvider",
		);
	}
	return context;
}

export { TransactionContext };
