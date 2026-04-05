import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { calculateDailyBudget, calculateSafeLimit } from "../utils/algorithms";
import { plannedMealStorage } from "../services/storageService";
import { pushPlannedMealsToCloud } from "../services/cloudSync";
import "../styles/ProfileSetup.css"; // Reuse setup styles for forms

export default function Settings() {
	const navigate = useNavigate();
	const { user, updateUser, resetUser, resetMonthlyCredits } = useUser();
	const { clearAllTransactions } = useTransactions();
	const { authUser } = useAuth();

	const [formData, setFormData] = useState({
		monthlyLimit: user?.monthlyLimit || 5000,
		preference: user?.preference || "both",
		diet: user?.diet || "mixed",
	});

	const [successMsg, setSuccessMsg] = useState("");
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "monthlyLimit" ? parseInt(value) || "" : value,
		}));
		setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const validateForm = () => {
		const newErrors = {};
		if (formData.monthlyLimit < 100) {
			newErrors.monthlyLimit = "Monthly limit must be at least 100 credits";
		}
		if (formData.monthlyLimit > 10000) {
			newErrors.monthlyLimit = "Monthly limit cannot exceed 10000 credits";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		if (validateForm()) {
			const userData = {
				...user,
				...formData,
				dailyBudget: calculateDailyBudget(formData.monthlyLimit),
				safeLimit: calculateSafeLimit(formData.monthlyLimit),
			};
			await updateUser(userData);
			setSuccessMsg("Profile updated successfully!");
			setTimeout(() => setSuccessMsg(""), 3000);
		}
	};

	const handleResetData = async () => {
		if (
			window.confirm(
				"Are you sure you want to reset all credit and transaction data? This cannot be undone.",
			)
		) {
			await clearAllTransactions();
			await resetMonthlyCredits();
			await plannedMealStorage.save([]);
			if (authUser?.uid) {
				pushPlannedMealsToCloud(authUser.uid);
			}
			setSuccessMsg("All credit history has been reset. Starting fresh!");
			setTimeout(() => setSuccessMsg(""), 3000);
		}
	};

	const handleSignOut = async () => {
		if (window.confirm("Are you sure you want to sign out?")) {
			await resetUser();
			navigate("/");
		}
	};

	return (
		<div
			className="profile-setup"
			style={{
				minHeight: "calc(100vh - var(--navbar-height))",
				padding: "32px 0",
			}}
		>
			<div
				className="setup-container"
				style={{ maxWidth: "600px", margin: "0 auto" }}
			>
				<div
					className="setup-step animation-fade-in"
					style={{ display: "block" }}
				>
					<h2>Profile Settings</h2>
					<p className="subtitle">
						Manage your budget limits, preferences, and data
					</p>

					{successMsg && (
						<div
							style={{
								background: "var(--emerald-50)",
								color: "var(--emerald-600)",
								padding: "12px 16px",
								borderRadius: "8px",
								marginBottom: "24px",
								fontWeight: "500",
								border: "1px solid var(--emerald-400)",
							}}
						>
							{successMsg}
						</div>
					)}

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							marginBottom: "30px",
							padding: "24px",
							background: "var(--bg-glass)",
							borderRadius: "var(--radius-lg)",
						}}
					>
						{user?.photoURL && (
							<img
								src={user.photoURL}
								alt="Profile"
								referrerPolicy="no-referrer"
								style={{
									width: "80px",
									height: "80px",
									borderRadius: "50%",
									marginBottom: "16px",
									border: "3px solid var(--primary-500)",
									objectFit: "cover",
								}}
							/>
						)}
						<h3 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>
							{user?.name || "User"}
						</h3>
						<p
							style={{
								margin: "0 0 0 0",
								color: "var(--text-secondary)",
								fontSize: "14px",
							}}
						>
							{user?.email}
						</p>
					</div>

					<form onSubmit={handleUpdateProfile}>
						<div className="form-group">
							<label
								htmlFor="monthlyLimit"
								style={{
									fontWeight: "600",
									marginBottom: "8px",
									display: "block",
								}}
							>
								Monthly Credit Budget
							</label>
							<input
								type="number"
								id="monthlyLimit"
								name="monthlyLimit"
								value={formData.monthlyLimit}
								onChange={handleChange}
								min="100"
								max="10000"
								className={errors.monthlyLimit ? "error" : ""}
								style={{
									width: "100%",
									padding: "12px 16px",
									borderRadius: "8px",
									border: "1px solid var(--border-light)",
									fontSize: "16px",
									background: "var(--bg-body)",
								}}
							/>
							{errors.monthlyLimit && (
								<span
									className="error-text"
									style={{
										color: "var(--danger-500)",
										fontSize: "13px",
										marginTop: "4px",
										display: "block",
									}}
								>
									{errors.monthlyLimit}
								</span>
							)}
						</div>

						<div className="form-group" style={{ marginTop: "20px" }}>
							<label
								style={{
									fontWeight: "600",
									marginBottom: "12px",
									display: "block",
								}}
							>
								Dietary Preference
							</label>
							<div
								className="options-grid"
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(3, 1fr)",
									gap: "12px",
								}}
							>
								{["veg", "non-veg", "mixed"].map((diet) => (
									<button
										key={diet}
										type="button"
										className={`option-btn ${formData.diet === diet ? "selected" : ""}`}
										onClick={() => setFormData((prev) => ({ ...prev, diet }))}
										style={{
											padding: "12px",
											borderRadius: "8px",
											border:
												formData.diet === diet
													? "2px solid var(--primary-500)"
													: "1px solid var(--border-light)",
											background:
												formData.diet === diet
													? "var(--primary-50)"
													: "var(--bg-body)",
											color:
												formData.diet === diet
													? "var(--primary-700)"
													: "var(--text-secondary)",
											cursor: "pointer",
											fontWeight: "500",
											textTransform: "capitalize",
										}}
									>
										{diet}
									</button>
								))}
							</div>
						</div>

						<button
							type="submit"
							className="btn btn-primary btn-block"
							style={{
								width: "100%",
								padding: "14px",
								borderRadius: "8px",
								background: "var(--primary-500)",
								color: "white",
								fontWeight: "bold",
								fontSize: "16px",
								border: "none",
								cursor: "pointer",
								marginTop: "24px",
							}}
						>
							Save Changes
						</button>
					</form>

					<hr
						style={{
							border: "none",
							borderTop: "1px solid var(--border-light)",
							margin: "40px 0",
						}}
					/>

					<div>
						<h3 style={{ color: "var(--danger-500)", marginBottom: "16px" }}>
							Danger Zone
						</h3>

						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								padding: "16px",
								background: "var(--danger-50)",
								borderRadius: "8px",
								border: "1px solid var(--danger-400)",
								marginBottom: "16px",
							}}
						>
							<div>
								<h4 style={{ margin: "0 0 4px 0", color: "var(--danger-600)" }}>
									Reset Credit Data
								</h4>
								<p
									style={{
										margin: 0,
										fontSize: "13px",
										color: "var(--danger-500)",
									}}
								>
									Clear all transaction history and start credits from 0
								</p>
							</div>
							<button
								onClick={handleResetData}
								style={{
									padding: "8px 16px",
									background: "var(--danger-500)",
									border: "1px solid var(--danger-500)",
									color: "white",
									borderRadius: "6px",
									fontWeight: "600",
									cursor: "pointer",
								}}
							>
								Reset Data
							</button>
						</div>

						<button
							onClick={handleSignOut}
							className="btn btn-secondary btn-block"
							style={{
								width: "100%",
								padding: "12px",
								borderRadius: "8px",
								border: "1px solid var(--danger-500)",
								background: "var(--danger-500)",
								color: "white",
								fontWeight: "600",
								cursor: "pointer",
							}}
						>
							Sign Out & Delete Local Data
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
