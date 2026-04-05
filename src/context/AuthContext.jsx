import React, { createContext, useContext, useState, useEffect } from "react";
import {
	onAuthStateChanged,
	signInWithPopup,
	signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebaseConfig";
import {
	ALLOWED_DOMAIN,
	isAllowedDomainEmail,
	getDomainRestrictionMessage,
	getPopupDomainRestrictionMessage,
	shouldSuppressPopupError,
} from "../utils/authUtils";

const AuthContext = createContext();

export function AuthProvider({ children }) {
	const [authUser, setAuthUser] = useState(null);
	const [isAuthLoading, setIsAuthLoading] = useState(true);
	const [authError, setAuthError] = useState(null);

	// Listen for Firebase auth state changes
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user) {
				// Verify domain
				if (isAllowedDomainEmail(user.email, ALLOWED_DOMAIN)) {
					setAuthUser(user);
					setAuthError(null);
				} else {
					// Wrong domain — sign them out
					firebaseSignOut(auth);
					setAuthUser(null);
					setAuthError(getDomainRestrictionMessage(ALLOWED_DOMAIN));
				}
			} else {
				setAuthUser(null);
			}
			setIsAuthLoading(false);
		});

		return () => unsubscribe();
	}, []);

	// Sign in with Google
	const signInWithGoogle = async () => {
		try {
			setAuthError(null);
			const result = await signInWithPopup(auth, googleProvider);
			const user = result.user;

			if (!isAllowedDomainEmail(user.email, ALLOWED_DOMAIN)) {
				await firebaseSignOut(auth);
				setAuthUser(null);
				setAuthError(
					getPopupDomainRestrictionMessage(user.email, ALLOWED_DOMAIN),
				);
				return null;
			}

			setAuthUser(user);
			return user;
		} catch (error) {
			// Don't show error for user-cancelled popup
			if (!shouldSuppressPopupError(error.code)) {
				setAuthError(error.message);
			}
			return null;
		}
	};

	// Sign out
	const signOutUser = async () => {
		try {
			await firebaseSignOut(auth);
			setAuthUser(null);
			setAuthError(null);
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	// Clear error
	const clearAuthError = () => setAuthError(null);

	const value = {
		authUser,
		isAuthLoading,
		authError,
		signInWithGoogle,
		signOut: signOutUser,
		clearAuthError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

export { AuthContext };
