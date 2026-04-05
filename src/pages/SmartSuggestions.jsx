import React, { useState, useMemo, useRef, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { useMenu } from "../context/MenuContext";
import { plannedMealStorage } from "../services/storageService";
import { pushPlannedMealsToCloud, debouncedSync } from "../services/cloudSync";

import { generateMealCombos } from "../utils/algorithms";
import {
	IconSuggestions,
	IconSearch,
	IconPlus,
	IconCheck,
	IconLeaf,
	IconDrumstick,
} from "../components/Illustrations";
import "../styles/SmartSuggestions.css";

export default function SmartSuggestions() {
	const { user } = useUser();
	const { authUser } = useAuth();
	const { transactions, addTransaction } = useTransactions();
	const { menuItems } = useMenu();

	const [selectedBudget, setSelectedBudget] = useState(null);
	const [mealTypes, setMealTypes] = useState(["breakfast", "lunch", "dinner"]);
	const [preference, setPreference] = useState(user?.preference || "both");
	const [suggestions, setSuggestions] = useState(null);
	const [toasts, setToasts] = useState([]);
	const plannedMealWriteQueueRef = useRef(Promise.resolve());

	// Show a toast notification
	const showToast = (message, type = "success") => {
		const id = Date.now();
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 3000);
	};

	// Calculate available budget for today
	const todayBudget = useMemo(() => {
		if (!user) return 0;
		const today = new Date().toISOString().split("T")[0];
		const todaySpent = transactions
			.filter((t) => t.date && t.date.startsWith(today))
			.reduce((sum, t) => sum + (t.totalCredits || 0), 0);
		const dailyLimit = Math.floor(user.monthlyLimit / 30);
		return Math.max(0, dailyLimit - todaySpent);
	}, [user, transactions]);

	// Calculate monthly progress
	const monthlyProgress = useMemo(() => {
		if (!user) return 0;
		const now = new Date();
		const monthSpent = transactions
			.filter((t) => {
				const date = new Date(t.date);
				return (
					date.getMonth() === now.getMonth() &&
					date.getFullYear() === now.getFullYear()
				);
			})
			.reduce((sum, t) => sum + (t.totalCredits || 0), 0);
		return Math.min(100, Math.round((monthSpent / user.monthlyLimit) * 100));
	}, [user, transactions]);

	const budget = selectedBudget || todayBudget;

	const getTodayPlanDate = () => {
		const today = new Date();
		return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
	};

	const resolveMealType = (meal) => {
		return Array.isArray(meal.mealType) && meal.mealType.length > 0
			? meal.mealType[0]
			: "lunch";
	};

	const addMealsToTodayPlan = useCallback(
		(meals, planDate) => {
			plannedMealWriteQueueRef.current = plannedMealWriteQueueRef.current
				.catch(() => undefined)
				.then(async () => {
					const existingMeals = await plannedMealStorage.getAll();
					const newPlannedMeals = meals.map((meal) => ({
						date: planDate,
						mealType: resolveMealType(meal),
						mealName: meal.name,
						mealId: meal.id,
						credits: meal.credits,
						isVeg: meal.isVeg,
					}));

					await plannedMealStorage.save([...existingMeals, ...newPlannedMeals]);
					if (authUser?.uid) {
						debouncedSync(authUser.uid, pushPlannedMealsToCloud, 2000);
					}
				});

			return plannedMealWriteQueueRef.current;
		},
		[authUser],
	);

	const addMealsAsTransactions = async (meals, planDate) => {
		await Promise.all(
			meals.map((meal) =>
				addTransaction({
					mealName: meal.name,
					mealId: meal.id,
					totalCredits: meal.credits,
					category: meal.category,
					mealType: resolveMealType(meal),
					isVeg: meal.isVeg,
					date: new Date().toISOString(),
					linkedPlannedMealDate: planDate,
				}),
			),
		);
	};

	const todayItems = useMemo(() => {
		const today = new Date();
		const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
		let itemsForToday = menuItems.filter(
			(item) => item.dateAvailable === todayStr,
		);
		if (itemsForToday.length === 0 && menuItems.length > 0) {
			const availableDates = Array.from(
				new Set(menuItems.map((item) => item.dateAvailable).filter(Boolean)),
			).sort();
			const futureDate = availableDates.find((d) => d >= todayStr);
			const fallbackDate = futureDate || availableDates[0];
			itemsForToday = menuItems.filter(
				(item) => item.dateAvailable === fallbackDate,
			);
		}
		return itemsForToday.length > 0 ? itemsForToday : menuItems;
	}, [menuItems]);

	const handleGetSuggestions = () => {
		if (budget <= 0) {
			showToast("No budget available! Try a custom amount.", "error");
			return;
		}

		const result = generateMealCombos(
			budget,
			{ mealTypes, preference },
			todayItems,
		);

		setSuggestions({
			budget,
			mealTypes,
			combos: result.combos,
		});
	};

	const handleAddCombo = async (combo, comboIndex) => {
		const planDate = getTodayPlanDate();
		await addMealsToTodayPlan(combo.items, planDate);
		await addMealsAsTransactions(combo.items, planDate);
		showToast(`Added Combo ${comboIndex + 1} to today's meal plan`);
	};

	if (!user) {
		return (
			<div className="smart-suggestions">
				<p>Please complete profile setup first.</p>
			</div>
		);
	}

	return (
		<div className="smart-suggestions">
			<div className="suggestions-header">
				<h1>
					<IconSuggestions size={32} /> Smart Suggestions
				</h1>
				<p>Get personalized meal recommendations based on your budget</p>
			</div>

			{/* Budget Cards */}
			<div className="budget-section">
				<h2>Select Budget</h2>
				<div className="budget-cards">
					<div
						className={`card ${selectedBudget === null ? "active" : ""}`}
						onClick={() => setSelectedBudget(null)}
					>
						<p className="label">Today's Available</p>
						<p className="amount">{todayBudget}</p>
						<p className="subtitle">credits</p>
					</div>
					<div
						className={`card ${selectedBudget === user.monthlyLimit ? "active" : ""}`}
						onClick={() => setSelectedBudget(user.monthlyLimit)}
					>
						<p className="label">Full Monthly</p>
						<p className="amount">{user.monthlyLimit}</p>
						<p className="subtitle">credits</p>
					</div>
					<div
						className={`card ${selectedBudget === Math.floor(user.monthlyLimit * 0.5) ? "active" : ""}`}
						onClick={() =>
							setSelectedBudget(Math.floor(user.monthlyLimit * 0.5))
						}
					>
						<p className="label">Half Budget</p>
						<p className="amount">{Math.floor(user.monthlyLimit * 0.5)}</p>
						<p className="subtitle">credits</p>
					</div>
					<div className="card custom">
						<label>
							<p className="label">Custom Amount</p>
							<input
								type="number"
								min="1"
								max={user.monthlyLimit}
								value={selectedBudget === null ? "" : selectedBudget}
								onChange={(e) =>
									setSelectedBudget(parseInt(e.target.value) || null)
								}
								placeholder="Enter amount"
							/>
						</label>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="filters-section">
				<h2>Customize Preferences</h2>
				<div className="filters-grid">
					<div className="filter-group">
						<label>Include in Combo</label>
						<div
							className="checkbox-group"
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: "0.5rem",
								marginTop: "0.5rem",
							}}
						>
							{["breakfast", "lunch", "snack", "dinner"].map((type) => (
								<label
									key={type}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
										fontSize: "0.9rem",
										cursor: "pointer",
									}}
								>
									<input
										type="checkbox"
										checked={mealTypes.includes(type)}
										onChange={(e) => {
											if (e.target.checked) {
												setMealTypes([...mealTypes, type]);
											} else {
												setMealTypes(mealTypes.filter((t) => t !== type));
											}
										}}
									/>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</label>
							))}
						</div>
					</div>

					<div className="filter-group">
						<label>Food Preference</label>
						<select
							value={preference}
							onChange={(e) => setPreference(e.target.value)}
						>
							<option value="both">All Options</option>
							<option value="veg">Veg</option>
							<option value="non-veg">Non Veg</option>
						</select>
					</div>
				</div>

				<button className="btn btn-primary" onClick={handleGetSuggestions}>
					<IconSearch size={18} /> Get Recommendations
				</button>
			</div>

			{/* Recommendations */}
			{suggestions && (
				<div className="recommendations-section">
					<h2>Recommended Meal Combos</h2>
					<div className="recommendations-info">
						<p>
							Target Budget: <strong>{suggestions.budget}</strong> credits
						</p>
					</div>

					{suggestions.combos && suggestions.combos.length > 0 ? (
						<div
							className="combos-list"
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
								gap: "1.5rem",
							}}
						>
							{suggestions.combos.map((combo, idx) => (
								<div
									key={idx}
									className="combo-card"
									style={{
										display: "flex",
										flexDirection: "column",
										border: "2px dashed var(--primary-500)",
										borderRadius: "12px",
										padding: "1.25rem",
										background: "var(--bg-card)",
										height: "100%",
									}}
								>
									<div
										className="combo-header"
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											marginBottom: "1rem",
											borderBottom: "1px solid var(--border-color)",
											paddingBottom: "0.5rem",
										}}
									>
										<h3 style={{ margin: 0 }}>Combo Option {idx + 1}</h3>
										<div className="combo-stats" style={{ fontSize: "0.9rem" }}>
											Total: <strong>{combo.totalCredits} pts</strong> |
											Remaining:{" "}
											<strong>{suggestions.budget - combo.totalCredits}</strong>
										</div>
									</div>
									<div className="meals-grid">
										{combo.items.map((meal) => (
											<div key={meal.id} className="meal-card">
												<div className="meal-header">
													<h3>{meal.name}</h3>
													<span
														className={`tag ${meal.isVeg ? "veg" : "non-veg"}`}
													>
														{meal.isVeg ? (
															<>
																<IconLeaf size={14} /> Veg
															</>
														) : (
															<>
																<IconDrumstick size={14} /> Non Veg
															</>
														)}
													</span>
												</div>

												<div className="meal-details">
													<span className="meal-type">
														{meal.mealType.join(", ")}
													</span>
													<span className="credits-badge">
														{meal.credits} pts
													</span>
												</div>
											</div>
										))}
									</div>
									<button
										className="btn btn-primary"
										style={{
											marginTop: "auto",
											paddingTop: "1rem",
											width: "100%",
											justifyContent: "center",
										}}
										onClick={() => handleAddCombo(combo, idx)}
									>
										<IconPlus size={16} /> Add Combo
									</button>
								</div>
							))}
						</div>
					) : (
						<div className="no-results">
							<p>No meal combos found within your budget and preferences.</p>
							<p>Try increasing your budget or adjusting filters.</p>
						</div>
					)}
				</div>
			)}

			{/* Monthly Progress */}
			<div className="progress-section">
				<h2>Monthly Progress</h2>
				<div className="progress-info">
					<div className="progress-bar-container">
						<div className="progress-bar">
							<div
								className="progress-fill"
								style={{ width: `${monthlyProgress}%` }}
							></div>
						</div>
						<p className="progress-text">
							{monthlyProgress}% of monthly budget used
						</p>
					</div>
				</div>
			</div>

			{/* Toast notifications */}
			{toasts.length > 0 && (
				<div className="toast-container">
					{toasts.map((toast) => (
						<div key={toast.id} className={`toast ${toast.type}`}>
							<span className="toast-icon">
								{toast.type === "success" ? <IconCheck size={18} /> : "⚠️"}
							</span>
							{toast.message}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
