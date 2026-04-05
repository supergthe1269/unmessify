import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useTheme } from "../context/ThemeContext";
import {
	BrandLogo,
	IconDashboard,
	IconSuggestions,
	IconPlanner,
	IconLogout,
	IconMenuBoard,
	IconSettings,
} from "./Illustrations";
import "../styles/Navigation.css";

export default function Navigation() {
	const { user, resetUser } = useUser();
	const { theme, toggleTheme } = useTheme();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleLogout = () => {
		resetUser();
	};

	return (
		<nav className="navbar">
			<div className="nav-container">
				<NavLink to="/" className="nav-brand">
					<BrandLogo size={28} />
					<span>UNMESSIFY</span>
				</NavLink>

				<button
					className="nav-toggle"
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					aria-label="Toggle menu"
				>
					<span></span>
					<span></span>
					<span></span>
				</button>

				<div className={`nav-menu ${mobileMenuOpen ? "open" : ""}`}>
					<NavLink
						to="/dashboard"
						className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
						onClick={() => setMobileMenuOpen(false)}
					>
						<IconDashboard size={18} /> Dashboard
					</NavLink>
					<NavLink
						to="/suggestions"
						className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
						onClick={() => setMobileMenuOpen(false)}
					>
						<IconSuggestions size={18} /> Suggestions
					</NavLink>
					<NavLink
						to="/menu"
						className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
						onClick={() => setMobileMenuOpen(false)}
					>
						<IconMenuBoard size={18} /> Menu
					</NavLink>
					<NavLink
						to="/planner"
						className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
						onClick={() => setMobileMenuOpen(false)}
					>
						<IconPlanner size={18} /> Planner
					</NavLink>
					<NavLink
						to="/settings"
						className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
						onClick={() => setMobileMenuOpen(false)}
					>
						<IconSettings size={18} /> Settings
					</NavLink>
				</div>

				<div className="nav-actions">
					<button
						className="btn-icon theme-toggle"
						onClick={toggleTheme}
						title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
					>
						{theme === "light" ? "🌙" : "☀️"}
					</button>
					<div
						className="user-info"
						style={{ display: "flex", alignItems: "center", gap: "10px" }}
					>
						{user?.photoURL && (
							<img
								src={user.photoURL}
								alt="Avatar"
								referrerPolicy="no-referrer"
								style={{
									width: "32px",
									height: "32px",
									borderRadius: "50%",
									objectFit: "cover",
									border: "2px solid var(--primary-500)",
								}}
							/>
						)}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								alignItems: "flex-start",
							}}
						>
							<p className="user-name" style={{ margin: 0 }}>
								{user?.name?.split(" ")[0]}
							</p>
							<p
								className="user-budget"
								style={{ margin: 0, fontSize: "12px" }}
							>
								{user?.monthlyLimit} pts/mo
							</p>
						</div>
					</div>
					<button
						className="btn-icon btn-logout"
						onClick={handleLogout}
						title="Logout"
					>
						<IconLogout size={20} />
					</button>
				</div>
			</div>
		</nav>
	);
}
