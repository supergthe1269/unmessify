import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserProvider, useUser } from "./context/UserContext";
import { TransactionProvider } from "./context/TransactionContext";
import { MenuProvider } from "./context/MenuContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navigation from "./components/Navigation";
import GuestMode from "./pages/GuestMode";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import SmartSuggestions from "./pages/SmartSuggestions";
import MenuPlanner from "./pages/MenuPlanner";
import MenuPage from "./pages/Menu";
import Settings from "./pages/Settings";
import { getAppViewMode } from "./utils/routeMode";
import "./styles/App.css";

function AppRoutes() {
	const { authUser, isAuthLoading } = useAuth();
	const { user, isLoading: isUserLoading } = useUser();
	const mode = getAppViewMode({
		authUser,
		user,
		isAuthLoading,
		isUserLoading,
	});

	// Show loading screen while checking auth or fetching cloud data
	if (mode === "loading") {
		return (
			<div className="loading-screen">
				<div className="spinner"></div>
				<p>Loading UNMESSIFY...</p>
			</div>
		);
	}

	// Helper route configurations
	const renderGuestRoutes = () => (
		<Routes>
			<Route path="/" element={<GuestMode />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);

	const renderSetupRoutes = () => (
		<Routes>
			<Route path="/setup" element={<ProfileSetup />} />
			<Route path="*" element={<Navigate to="/setup" replace />} />
		</Routes>
	);

	const renderAppRoutes = () => (
		<Routes>
			<Route path="/dashboard" element={<Dashboard />} />
			<Route path="/suggestions" element={<SmartSuggestions />} />
			<Route path="/planner" element={<MenuPlanner />} />
			<Route path="/menu" element={<MenuPage />} />
			<Route path="/settings" element={<Settings />} />
			<Route path="/" element={<Navigate to="/dashboard" replace />} />
			<Route path="*" element={<Navigate to="/dashboard" replace />} />
		</Routes>
	);
	return (
		<>
			{authUser && user && <Navigation />}
			<div className={authUser && user ? "app-container" : ""}>
				{mode === "guest"
					? renderGuestRoutes()
					: mode === "setup"
						? renderSetupRoutes()
						: renderAppRoutes()}
			</div>
		</>
	);
}

export default function App() {
	return (
		<ThemeProvider>
			<BrowserRouter>
				<AuthProvider>
					<UserProvider>
						<TransactionProvider>
							<MenuProvider>
								<AppRoutes />
							</MenuProvider>
						</TransactionProvider>
					</UserProvider>
				</AuthProvider>
			</BrowserRouter>
		</ThemeProvider>
	);
}
