import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { userStorage, clearAllStorage } from "../services/storageService";
import { useAuth } from "./AuthContext";
import { syncOnLogin, pushProfileToCloud, debouncedSync } from "../services/cloudSync";

const UserContext = createContext();

export function UserProvider({ children }) {
	const { authUser, signOut: authSignOut } = useAuth();
	const [user, setUser] = useState(null);
	const [isFirstTime, setIsFirstTime] = useState(true);
	const [isLoading, setIsLoading] = useState(true);

	// Load user data when auth state changes
	useEffect(() => {
		let cancelled = false;

		async function loadUserData() {
			if (!authUser) {
				// Not logged in
				setUser(null);
				setIsFirstTime(true);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);

			try {
				// Sync with cloud — pull data from Firestore
				const { isNewUser, profile } = await syncOnLogin(authUser.uid);

				if (cancelled) return;

				if (!isNewUser && profile && profile.name) {
					setUser(profile);
					setIsFirstTime(false);
				} else {
					// Check local IndexedDB just in case sync failed
					const localUser = await userStorage.get();
					if (localUser && localUser.name) {
						setUser(localUser);
						setIsFirstTime(false);
					} else {
						// True first-time user
						setUser(null);
						setIsFirstTime(true);
					}
				}
			} catch (error) {
				console.error('Error loading user data:', error);
				// Fall back to local
				const localUser = await userStorage.get();
				if (localUser && localUser.name) {
					setUser(localUser);
					setIsFirstTime(false);
				}
			}

			if (!cancelled) {
				setIsLoading(false);
			}
		}

		loadUserData();
		return () => { cancelled = true; };
	}, [authUser]);

	// Create or update user profile
	const updateUser = useCallback(async (userData) => {
		const userWithTimestamp = {
			...userData,
			updatedAt: new Date().toISOString(),
			createdAt: user?.createdAt || new Date().toISOString(),
			// Store the auth email for reference
			email: authUser?.email || userData.email,
			photoURL: authUser?.photoURL || userData.photoURL,
			name: userData.name || authUser?.displayName || 'User',
		};

		// Save to IndexedDB
		await userStorage.save(userWithTimestamp);
		setUser(userWithTimestamp);
		setIsFirstTime(false);

		// Push to Firestore (debounced)
		if (authUser) {
			debouncedSync(authUser.uid, (uid) => pushProfileToCloud(uid, userWithTimestamp), 1000);
		}
	}, [authUser, user?.createdAt]);

	// Reset user data (logout) — clears all app data + signs out
	const resetUser = useCallback(async () => {
		try {
			// Clear all local storage
			await clearAllStorage();
			setUser(null);
			setIsFirstTime(true);

			// Sign out from Firebase
			await authSignOut();
		} catch (error) {
			console.error('Logout error:', error);
			// Force clear state even if sign-out fails
			setUser(null);
			setIsFirstTime(true);
		}
	}, [authSignOut]);

	// Update monthly credits (for new month reset)
	const resetMonthlyCredits = useCallback(async () => {
		if (user) {
			const updatedUser = {
				...user,
				currentMonthStart: new Date().toISOString(),
			};
			await userStorage.save(updatedUser);
			setUser(updatedUser);

			if (authUser) {
				debouncedSync(authUser.uid, (uid) => pushProfileToCloud(uid, updatedUser), 1000);
			}
		}
	}, [user, authUser]);

	const value = {
		user,
		isFirstTime,
		isLoading,
		updateUser,
		resetUser,
		resetMonthlyCredits,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook for using user context
export function useUser() {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
}

export { UserContext };
