import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { useMenu } from "../context/MenuContext";
import { useTransactions } from "../context/TransactionContext";
import { plannedMealStorage } from "../services/storageService";
import { pushPlannedMealsToCloud, debouncedSync } from "../services/cloudSync";
import { useAuth } from "../context/AuthContext";
import {
	IconPlanner,
	IconPlus,
	IconTrash,
	IconClock,
	EmptyStateGraphic,
} from "../components/Illustrations";
import "../styles/MenuPlanner.css";

function Calendar({ year, month, plannedMeals, onDateClick, selectedDate }) {
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const daysInPrevMonth = new Date(year, month, 0).getDate();
	const today = new Date();
	const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

	const days = [];

	// Previous month days
	for (let i = daysInPrevMonth - firstDay + 1; i <= daysInPrevMonth; i++) {
		days.push({ date: null, isCurrentMonth: false, day: i });
	}

	// Current month days
	for (let i = 1; i <= daysInMonth; i++) {
		const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
		const meals = plannedMeals.filter((m) => m.date === dateStr);
		days.push({
			date: dateStr,
			isCurrentMonth: true,
			day: i,
			meals,
			isToday: dateStr === todayStr,
			isSelected: dateStr === selectedDate,
		});
	}

	// Next month days
	const remainingDays = 42 - days.length;
	for (let i = 1; i <= remainingDays; i++) {
		days.push({ date: null, isCurrentMonth: false, day: i });
	}

	const weeks = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7));
	}

	return (
		<div className="calendar">
			<div className="calendar-header">
				<div className="month-name">
					{new Date(year, month).toLocaleString("default", {
						month: "long",
						year: "numeric",
					})}
				</div>
			</div>

			<div className="weekdays">
				{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
					<div key={day} className="weekday">
						{day}
					</div>
				))}
			</div>

			<div className="days-grid">
				{weeks.map((week, weekIdx) =>
					week.map((day, dayIdx) => (
						<div
							key={`${weekIdx}-${dayIdx}`}
							className={[
								"day",
								day.isCurrentMonth ? "current-month" : "other-month",
								day.meals && day.meals.length > 0 ? "has-meals" : "",
								day.isToday ? "today" : "",
								day.isSelected ? "selected" : "",
							]
								.filter(Boolean)
								.join(" ")}
							onClick={() => day.isCurrentMonth && onDateClick(day.date)}
						>
							<div className="day-number">{day.day}</div>
							{day.meals && day.meals.length > 0 && (
								<div className="meal-indicator">
									<span className="meal-count">{day.meals.length}</span>
								</div>
							)}
						</div>
					)),
				)}
			</div>
		</div>
	);
}

// Add Meal Modal
export function AddMealModal({ date, menuItems, onAdd, onClose }) {
	const [filterPref, setFilterPref] = useState("both");
	const [selectedItems, setSelectedItems] = useState([]);
	const [selectedMealTime, setSelectedMealTime] = useState("lunch");

	const filteredItems = useMemo(() => {
		return menuItems.filter((item) => {
			// Only show items that are meant for this specific date
			if (item.dateAvailable && item.dateAvailable !== date) return false;

			if (selectedMealTime && !item.mealType.includes(selectedMealTime))
				return false;
			if (filterPref === "veg" && !item.isVeg) return false;
			if (filterPref === "non-veg" && item.isVeg) return false;
			return true;
		});
	}, [menuItems, selectedMealTime, filterPref, date]);

	const handleAdd = () => {
		if (selectedItems.length === 0) return;
		const mealsToAdd = selectedItems.map((selectedItem) => ({
			date,
			mealType: selectedMealTime,
			mealName: selectedItem.name,
			mealId: selectedItem.id,
			credits: selectedItem.credits,
			isVeg: selectedItem.isVeg,
		}));
		onAdd(mealsToAdd);
		onClose();
	};

	const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
	});

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal" onClick={(e) => e.stopPropagation()}>
				<h3>Add Meal</h3>
				<p className="modal-subtitle">
					<IconPlanner
						size={14}
						style={{ display: "inline", marginRight: 4 }}
					/>{" "}
					{dateLabel}
				</p>

				<div className="modal-filters">
					<select
						value={selectedMealTime}
						onChange={(e) => setSelectedMealTime(e.target.value)}
					>
						<option value="breakfast">Breakfast</option>
						<option value="lunch">Lunch</option>
						<option value="snack">Snack</option>
						<option value="dinner">Dinner</option>
					</select>
					<select
						value={filterPref}
						onChange={(e) => setFilterPref(e.target.value)}
					>
						<option value="both">All Options</option>
						<option value="veg">Veg Only</option>
						<option value="non-veg">Non-Veg Only</option>
					</select>
				</div>

				<div className="modal-menu-list">
					{filteredItems.map((item) => (
						<div
							key={item.id}
							className={`modal-menu-item ${selectedItems.some((i) => i.id === item.id) ? "selected" : ""}`}
							onClick={() => {
								setSelectedItems((prev) => {
									if (prev.find((i) => i.id === item.id)) {
										return prev.filter((i) => i.id !== item.id);
									}
									return [...prev, item];
								});
							}}
						>
							<div>
								<span className="item-name">{item.name}</span>
								<span
									className={`diet-dot ${item.isVeg ? "veg" : "non-veg"}`}
									style={{
										display: "inline-flex",
										alignItems: "center",
										justifyContent: "center",
										marginLeft: 8,
										width: 16,
										height: 16,
										border: `1px solid ${item.isVeg ? "#10b981" : "#f43f5e"}`,
										borderRadius: 3,
									}}
									title={item.isVeg ? "Veg" : "Non-Veg"}
								>
									<span
										style={{
											width: 8,
											height: 8,
											borderRadius: "50%",
											backgroundColor: item.isVeg ? "#10b981" : "#f43f5e",
										}}
									/>
								</span>
							</div>
							<span className="item-credits">{item.credits} pts</span>
						</div>
					))}
					{filteredItems.length === 0 && (
						<p
							style={{ textAlign: "center", color: "#94a3b8", padding: "20px" }}
						>
							No items match your filters
						</p>
					)}
				</div>

				<div className="modal-actions">
					<button className="btn btn-secondary" onClick={onClose}>
						Cancel
					</button>
					<button
						className="btn btn-primary"
						onClick={handleAdd}
						disabled={selectedItems.length === 0}
						style={{
							opacity: selectedItems.length > 0 ? 1 : 0.5,
							display: "flex",
							alignItems: "center",
							gap: "8px",
						}}
					>
						<IconPlus size={16} />{" "}
						{selectedItems.length > 1
							? `Add ${selectedItems.length} Meals`
							: "Add Meal"}
					</button>
				</div>
			</div>
		</div>
	);
}

export default function MenuPlanner() {
	const { user } = useUser();
	const { authUser } = useAuth();
	const { transactions, addTransaction, deleteTransaction } = useTransactions();
	const { menuItems } = useMenu();
	const now = new Date();
	const [year, setYear] = useState(now.getFullYear());
	const [month, setMonth] = useState(now.getMonth());
	const [selectedDate, setSelectedDate] = useState(null);
	const [showAddModal, setShowAddModal] = useState(false);

	// Load synchronously from localStorage fallback initially
	const [plannedMeals, setPlannedMeals] = useState(() => {
		const syncResult = plannedMealStorage.getAllSync();
		return Array.isArray(syncResult) ? syncResult : [];
	});

	// Safe setter
	const safeSetMeals = (data) =>
		setPlannedMeals(Array.isArray(data) ? data : []);

	// Fetch from IndexedDB asynchronously on mount and auth changes
	useEffect(() => {
		async function loadMeals() {
			const saved = await plannedMealStorage.getAll();
			safeSetMeals(saved);
		}
		loadMeals();
	}, [authUser]);

	// Sync to local and cloud whenever meals change, but only if they differ from what was loaded
	const updateMealsData = useCallback(
		async (newMeals) => {
			await plannedMealStorage.save(newMeals);
			safeSetMeals(newMeals);
			if (authUser) {
				debouncedSync(authUser.uid, pushPlannedMealsToCloud, 2000);
			}
		},
		[authUser],
	);

	const handlePrevMonth = () => {
		if (month === 0) {
			setYear(year - 1);
			setMonth(11);
		} else {
			setMonth(month - 1);
		}
	};

	const handleNextMonth = () => {
		if (month === 11) {
			setYear(year + 1);
			setMonth(0);
		} else {
			setMonth(month + 1);
		}
	};

	const handleToday = () => {
		const now = new Date();
		setYear(now.getFullYear());
		setMonth(now.getMonth());
	};

	const handleAddMeal = useCallback(
		(meals) => {
			const mealsToAdd = Array.isArray(meals) ? meals : [meals];

			setPlannedMeals((prev) => {
				const newMeals = [...prev, ...mealsToAdd];
				updateMealsData(newMeals);
				return newMeals;
			});

			mealsToAdd.forEach((meal) => {
				const plannedDate = meal.date
					? new Date(`${meal.date}T12:00:00`).toISOString()
					: new Date().toISOString();
				addTransaction({
					mealName: meal.mealName,
					mealId: meal.mealId || meal.id,
					totalCredits: meal.credits,
					mealType: meal.mealType,
					isVeg: meal.isVeg,
					date: plannedDate,
					linkedPlannedMealDate: meal.date,
				});
			});
		},
		[addTransaction, updateMealsData],
	);

	const handleDeleteMeal = useCallback(
		(date, mealType, mealName) => {
			setPlannedMeals((prev) => {
				const newMeals = prev.filter(
					(m) =>
						!(
							m.date === date &&
							m.mealType === mealType &&
							m.mealName === mealName
						),
				);
				updateMealsData(newMeals);
				return newMeals;
			});

			const matchedTransaction = transactions.find(
				(t) =>
					t.linkedPlannedMealDate === date &&
					t.mealType === mealType &&
					t.mealName === mealName,
			);
			if (matchedTransaction) {
				deleteTransaction(matchedTransaction.id);
			}
		},
		[deleteTransaction, transactions, updateMealsData],
	);

	const selectedDateMeals = useMemo(() => {
		if (!selectedDate) return [];
		return plannedMeals.filter((m) => m.date === selectedDate);
	}, [selectedDate, plannedMeals]);

	// Current month's meals only
	const currentMonthMeals = useMemo(() => {
		return plannedMeals.filter((m) => {
			const date = new Date(m.date);
			return date.getFullYear() === year && date.getMonth() === month;
		});
	}, [plannedMeals, year, month]);

	const monthTotal = useMemo(() => {
		return currentMonthMeals.reduce((sum, m) => sum + m.credits, 0);
	}, [currentMonthMeals]);

	// Upcoming meals (next 7 days)
	const upcomingMeals = useMemo(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const nextWeek = new Date(today);
		nextWeek.setDate(nextWeek.getDate() + 7);

		return plannedMeals
			.filter((m) => {
				const mealDate = new Date(m.date);
				mealDate.setHours(0, 0, 0, 0);
				return mealDate >= today && mealDate <= nextWeek;
			})
			.sort((a, b) => new Date(a.date) - new Date(b.date))
			.slice(0, 5);
	}, [plannedMeals]);

	if (!user) {
		return (
			<div className="menu-planner">Please complete profile setup first.</div>
		);
	}

	return (
		<div className="menu-planner">
			<div className="planner-header">
				<h1>
					<IconPlanner size={32} /> Menu Planner
				</h1>
				<p>Plan your meals for the month and track your spending</p>
			</div>

			<div className="planner-container">
				<div className="calendar-section">
					<div className="calendar-controls">
						<button className="btn-nav" onClick={handlePrevMonth}>
							‹ Prev
						</button>
						<button className="btn-today" onClick={handleToday}>
							Today
						</button>
						<button className="btn-nav" onClick={handleNextMonth}>
							Next ›
						</button>
					</div>

					<Calendar
						year={year}
						month={month}
						plannedMeals={plannedMeals}
						onDateClick={setSelectedDate}
						selectedDate={selectedDate}
					/>

					<div className="calendar-stats">
						<div className="stat-box">
							<p className="label">Meals This Month</p>
							<p className="value">{currentMonthMeals.length}</p>
						</div>
						<div className="stat-box">
							<p className="label">Total Credits</p>
							<p className="value">{monthTotal}</p>
						</div>
						<div className="stat-box">
							<p className="label">Avg / Meal</p>
							<p className="value">
								{currentMonthMeals.length > 0
									? Math.round(monthTotal / currentMonthMeals.length)
									: 0}
							</p>
						</div>
					</div>
				</div>

				<div className="details-section">
					{selectedDate ? (
						<div className="date-details">
							<h2>
								{new Date(selectedDate + "T12:00:00").toLocaleDateString(
									"en-US",
									{
										weekday: "long",
										year: "numeric",
										month: "long",
										day: "numeric",
									},
								)}
							</h2>

							{selectedDateMeals.length > 0 ? (
								<div className="meals-list">
									{selectedDateMeals.map((meal, idx) => (
										<div key={idx} className="meal-item">
											<div className="meal-info">
												<p className="meal-time">{meal.mealType}</p>
												<p className="meal-name">{meal.mealName}</p>
											</div>
											<span className="meal-credits">{meal.credits} pts</span>
											<button
												className="btn-delete"
												onClick={() =>
													handleDeleteMeal(
														meal.date,
														meal.mealType,
														meal.mealName,
													)
												}
												title="Remove meal"
											>
												<IconTrash size={16} />
											</button>
										</div>
									))}
									<div className="meals-total">
										<p>Total for the day:</p>
										<p className="total-value">
											{selectedDateMeals.reduce((sum, m) => sum + m.credits, 0)}{" "}
											credits
										</p>
									</div>
								</div>
							) : (
								<div className="empty-state">
									<EmptyStateGraphic type="no-meals" size={120} />
									<p>No meals planned for this date</p>
								</div>
							)}

							<button
								className="btn btn-primary"
								style={{ width: "100%", marginTop: 16 }}
								onClick={() => setShowAddModal(true)}
							>
								+ Add Meal
							</button>
						</div>
					) : (
						<div className="no-selection">
							<p>👈 Select a date to view and plan meals</p>
						</div>
					)}
				</div>
			</div>

			{/* Upcoming Section */}
			<div className="upcoming-section">
				<h2>
					<IconClock
						size={20}
						style={{
							display: "inline",
							marginRight: 8,
							verticalAlign: "middle",
						}}
					/>{" "}
					Upcoming Meals (Next 7 Days)
				</h2>
				<div className="upcoming-list">
					{upcomingMeals.length > 0 ? (
						upcomingMeals.map((meal, idx) => (
							<div key={idx} className="upcoming-item">
								<div className="item-date">
									{new Date(meal.date + "T12:00:00").toLocaleDateString(
										"en-US",
										{
											month: "short",
											day: "numeric",
										},
									)}
								</div>
								<div className="item-details">
									<p className="item-meal">{meal.mealName}</p>
									<p className="item-type">{meal.mealType}</p>
								</div>
								<div className="item-credits">{meal.credits}</div>
							</div>
						))
					) : (
						<div className="no-upcoming">
							<p>
								No upcoming meals planned. Select a date above to start
								planning!
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Add Meal Modal */}
			{showAddModal && selectedDate && (
				<AddMealModal
					date={selectedDate}
					menuItems={menuItems}
					onAdd={handleAddMeal}
					onClose={() => setShowAddModal(false)}
				/>
			)}
		</div>
	);
}
